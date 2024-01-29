import '@styles/index.scss'
import 'react-datepicker/dist/react-datepicker.css'
import 'react-toastify/dist/ReactToastify.min.css'
import 'react-tooltip/dist/react-tooltip.css'

import { getCookie } from 'cookies-next'
import { getSession, SessionProvider } from 'next-auth/react'
import App, { AppContext, AppLayoutProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { SWRConfig } from 'swr'

import { MasterLayout } from '@components/Layouts/Master'
import { GoogleOAuthProvider } from '@react-oauth/google'
import api from '@services/api'
import { fetcher } from '@services/fetcher'
import { useActiveBusiness } from '@hooks/useActiveBusiness'

import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

const _APP = ({ Component, pageProps: { session, ga_token, ga_refresh_token, user, ...pageProps } }: AppLayoutProps) => {
  const getLayout = Component.getLayout ?? ((page) => page)
  const { query } = useRouter()
  const { business, setBusiness, resetBusiness } = useActiveBusiness()
  if (session?.jwt) {
    api.defaults.headers.common.Authorization = `Bearer ${session.jwt}`
  }
  if (ga_token) {
    api.defaults.headers.common.ga_token = ga_token
  }

  if (ga_refresh_token) {
    api.defaults.headers.common.ga_refresh_token = ga_refresh_token
  }

  useEffect(() => {
    const type = query?.type?.toString() as 'error' | 'success'
    if (query?.code && type) {
      toast?.[type](query.msg?.toString() || type)
      window.history.pushState({}, document.title, window.location.pathname)
    }
  }, [query])

  useEffect(() => {
    // validate if current bussiness is their business
    const validateBusiness = user?.business?.map((b: any) => b._id).includes(business?._id)
    if (!validateBusiness) {
      resetBusiness()
    }
    if (user?.business?.length) {
      setBusiness(user.business?.[0])
      if (!business) {
        window.location.reload()
      }
    }
  }, [user])

  return (
    <SessionProvider session={session} refetchInterval={0} refetchOnWindowFocus={false}>
      <Head>
        <link rel="icon" type="image/png" href="/static/icons/favicon.png"></link>
        <meta name="robots" content="index, follow" />
        <title>Dashboard</title>
        {/* <script src="https://support.husl.xyz/js/min/jquery.min.js" />
        <script src="https://support.husl.xyz/js/main.js" /> */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `<script src="https://support.husl.xyz/js/min/jquery.min.js"></script> 
<script id="sbinit" src="https://support.husl.xyz/js/main.js"></script>`
          }}></script> */}
        <script
          key={session?.user?._id + '-intercom-session'}
          id={session?.user?._id + '-intercom-session'}
          dangerouslySetInnerHTML={{
            __html: `window.intercomSettings = {
                  api_base: "https://api-iam.intercom.io",
                  app_id: "n3etst6m",
                  name: "${user?.discordUsername || user?.name || user?.email || 'Guest'}",
                };`
          }}
        />
        <script
          key={session?.user?._id + '-intercom'}
          id={session?.user?._id + '-intercom-session'}
          dangerouslySetInnerHTML={{
            __html: `
                    (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/n3etst6m';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(document.readyState==='complete'){l();}else if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
                  `
          }}
        />
      </Head>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          fetcher
        }}>
        <GoogleOAuthProvider
          clientId={
            process.env.GOOGLE_CLIENT_ID || '203773490656-rqtktrlr2bp0lu49ntkgvrtj6rc1p4s0.apps.googleusercontent.com'
          }>
          <DndProvider backend={HTML5Backend}>
            <MasterLayout>
              {getLayout(<Component {...pageProps} />)}
              <ToastContainer
                theme="dark"
                position="top-center"
                toastClassName="!bg-dark"
                toastStyle={{
                  border: '1px solid rgba(255,255,255,.15)',
                  borderRadius: 10,
                  fontSize: 14
                }}
                progressStyle={{
                  height: 2.5
                }}
              />
            </MasterLayout>
          </DndProvider>
        </GoogleOAuthProvider>
      </SWRConfig>
    </SessionProvider>
  )
}

_APP.getInitialProps = async (appContext: AppContext) => {
  const appProps = await App.getInitialProps(appContext)
  const locale = appContext.ctx?.locale
  const query = appContext.ctx?.query
  const path = appContext.ctx?.pathname
  const ga_token = getCookie('ga_token', appContext.ctx)
  const ga_refresh_token = getCookie('ga_refresh_token', appContext.ctx)
  const session = await getSession({ req: appContext?.ctx?.req })
  const user = await api
    .get('/users/me', {
      headers: {
        Authorization: `Bearer ${session?.jwt}`
      }
    })
    .then(({ data }) => data?.data)
    .catch(() => null)

  /**
   * Redirect if not logged in
   */
  if (
    !session &&
    !path.startsWith('/admin') &&
    !path.startsWith('/services') &&
    !path.startsWith('/auth') &&
    !path.startsWith('/_error')
  ) {
    appContext.ctx.res?.writeHead(302, {
      Location: '/auth?code=401&type=error&msg=You have no authorization to see this page.'
    })
    appContext.ctx.res?.end()
    return {}
  }

  // if it's setting page and user is not admin
  if (path.startsWith('/settings') && user?.role !== 'admin') {
    appContext.ctx.res?.writeHead(302, {
      Location: '/'
    })
    appContext.ctx.res?.end()
    return {}
  }

  const props = { pageProps: { ...appProps.pageProps, locale, query, session, ga_token, ga_refresh_token, user } }
  return props
}

export default _APP
