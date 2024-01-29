import Button from '@components/Button'
import { FiExternalLink } from 'react-icons/fi'

const tools = [
  {
    name: 'Chat GPT',
    type: 'rss',
    link: 'https://chat.openai.com/',
    description: 'Fast writing of articles for SEO & captions.',
    image: 'https://chat.openai.com/apple-touch-icon.png'
  },
  {
    name: 'Canva',
    type: 'rss',
    link: 'https://www.canva.com/',
    description: 'For fast graphics (some video too)',
    image: 'https://static.canva.com/static/images/apple-touch-120x120-1.png'
  },
  {
    name: 'Biteable',
    type: 'rss',
    link: 'https://biteable.com/',
    description: 'For fast explainer videos',
    image: 'https://biteable.com/wp/wp-content/uploads/2022/12/cropped-Biteable202102-Favicon2-1-192x192.png'
  },
  {
    name: 'Fiverr',
    type: 'rss',
    link: 'https://www.fiverr.com/',
    description: 'Just about anything you need, including SEO',
    image: 'https://s3.us-central-1.wasabisys.com/husl-admin/public/fiverr-icon.png'
  },
  {
    name: 'Inflact',
    type: 'tools',
    link: 'https://inflact.com/tools/instagram-hashtag-generator/',
    description: 'Hashtag generator',
    image: 'https://inflact.com/apple-touch-icon.png'
  }
]
export const ToolsAndResorces: React.FC = () => {
  return (
    <div className="flex-1">
      <h1 className="text-lg">Tools and Resources</h1>
      <div className="flex flex-col w-full mt-5 space-y-5">
        {tools?.map((tool, i) => (
          <div key={i} className="w-full p-5 border border-gray-800 rounded-md bg-secondary">
            <div className="flex items-center space-x-5">
              <img src={tool?.image} className="object-contain w-20 h-20 bg-white rounded-md" />
              <div className="flex flex-col space-y-1">
                <div>
                  <div className="flex items-center space-x-2 text-xl">
                    <span>{tool?.name}</span>
                    {tool?.type === 'rss' && (
                      <button className="px-2 py-0 text-xs border rounded border-primary">Resources</button>
                    )}
                    {tool?.type === 'tools' && (
                      <button className="px-2 py-0 text-xs border rounded border-primary">Tools</button>
                    )}
                  </div>
                </div>
                <span className="text-sm">{tool?.description}</span>
              </div>
              <div className="flex justify-end flex-1">
                <Button url={tool?.link} variant="outline" className="px-3 border-gray-700" target="_blank">
                  <FiExternalLink />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
