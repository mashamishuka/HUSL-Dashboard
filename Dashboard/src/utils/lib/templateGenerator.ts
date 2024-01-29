import type CreativeEngine from '@cesdk/engine'
import { MimeType, DesignBlockType } from '@cesdk/engine'
import { Business } from '@src/restapi/businesses/business'
import { hextToRgbRanged } from '@utils/index'

const getTagCopies = (business?: Business) => {
  const tagCopy = business?.niche?.tagCopy
  const copyFrom: any = tagCopy?.map((v) => v.key?.replace(/\[|]/g, ''))
  const copyTo: any = tagCopy?.map((v) => v.value?.replace(/\[|]/g, ''))
  // this is default copy, you might want to make it dynamic
  copyFrom?.push('niche', 'company', 'primary color', 'secondary color', 'logo', 'favicon', 'domain')
  copyTo?.push(
    business?.niche?.name?.toString(),
    business?.name,
    business?.primaryColor,
    business?.secondaryColor,
    business?.logo?.url,
    business?.favicon?.url,
    business?.domain
  )
  return { copyFrom, copyTo }
}
/**
 * Functions to generate the template
 */
export const blockquote = async (engine: CreativeEngine, data?: Business) => {
  try {
    const scene = engine.scene.get()
    if (scene === null || scene === undefined) {
      throw new Error('Scene not found.')
    }
    const textVar = 'TIRED OF \n SPENDING MORE\nTIME ON\nMARKETING\n THAN ON\nMAKING ?'
    const primaryColor = data?.primaryColor || '#fff'
    const primaryColorRgba = hextToRgbRanged(primaryColor)
    const page = engine.block.create(DesignBlockType.Page)
    engine.block.appendChild(scene, page)
    engine.block.setWidthMode(page, 'Absolute')
    engine.block.setWidth(page, 800)
    engine.block.setHeightMode(page, 'Absolute')
    engine.block.setHeight(page, 800)

    const solidColor = engine.block.createFill('color')
    engine.block.setColorRGBA(
      solidColor,
      'color/value',
      primaryColorRgba.r,
      primaryColorRgba.g,
      primaryColorRgba.b,
      primaryColorRgba.a
    )
    engine.block.setFill(page, solidColor)

    const text = engine.block.create(DesignBlockType.Text)
    engine.block.setName(text, 'mainText')
    engine.block.setString(text, 'text/text', `“\n${textVar}\n”`)
    const textColor = engine.block.createFill('color')
    engine.block.setColorRGBA(textColor, 'color/value', 1, 1, 1)
    engine.block.setFloat(text, 'text/fontSize', 16)
    engine.block.setEnum(text, 'text/horizontalAlignment', 'Center')
    engine.block.setFillSolidColor(text, 1, 1, 1, 1)
    engine.block.setFloat(text, 'text/lineHeight', 1.4)
    engine.block.setFloat(text, 'text/letterSpacing', -0.06)
    engine.block.setString(text, 'text/fontFileUri', `https://app.husl.xyz/fonts/gotham-pro/GothamPro-Bold.ttf`)
    engine.block.setEnum(text, 'text/verticalAlignment', 'Center')

    engine.block.setWidth(text, engine.block.getWidth(page))
    engine.block.setHeight(text, engine.block.getHeight(page))

    engine.block.appendChild(page, text)

    const options = { pngCompressionLevel: 5 }
    const blob = await engine.block.export(scene, MimeType.Png, options)
    const blobUrl = URL.createObjectURL(blob)
    return blobUrl
  } catch (error: any) {
    console.log(error)
    throw new Error(error)
  }
}

export const genericGraphic = async (engine: CreativeEngine, data?: Business) => {
  const scene = engine.scene.get()
  if (scene === null || scene === undefined) {
    throw new Error('Scene not found.')
  }
  const backgroundImage = engine.block.findByType(DesignBlockType.Image)[0]
  const bg = data?.niche?.productMockups?.[0]?.mockups?.[0]?.url
  const tagCopies = getTagCopies(data)
  tagCopies.copyFrom?.forEach((from: any, index: number) => {
    engine.variable.setString(from, tagCopies.copyTo?.[index])
  })
  engine.block.setString(backgroundImage, 'image/imageFileURI', bg || '/templates/background-highlight.png')
  const options = { pngCompressionLevel: 5 }
  const blob = await engine.block.export(scene, MimeType.Png, options)
  const blobUrl = URL.createObjectURL(blob)
  return blobUrl
}

export const mockupDesktop = async (engine: CreativeEngine, data?: Business) => {
  const scene = engine.scene.get()
  if (scene === null || scene === undefined) {
    throw new Error('Scene not found.')
  }
  const pages = engine.block.findByType(DesignBlockType.Page)
  const page = pages[0]
  // change page background image
  const primaryColor = data?.primaryColor || '#fff'
  const primaryColorRgba = hextToRgbRanged(primaryColor)
  const solidColor = engine.block.createFill('color')
  engine.block.setColorRGBA(
    solidColor,
    'color/value',
    primaryColorRgba.r,
    primaryColorRgba.g,
    primaryColorRgba.b,
    primaryColorRgba.a
  )
  engine.block.setFill(page, solidColor)
  // change image mockup
  const mockup = engine.block.findByType(DesignBlockType.Image)[0]
  const mockupImage = data?.niche?.productMockups?.[0]?.desktopMockups?.[0]?.url

  engine.block.setContentFillMode(mockup, 'Contain')
  engine.block.setString(mockup, 'image/imageFileURI', mockupImage || 'https://i.imgur.com/NrDY9WO.png')
  const options = { pngCompressionLevel: 5 }
  const blob = await engine.block.export(scene, MimeType.Png, options)
  const blobUrl = URL.createObjectURL(blob)
  return blobUrl
}

export const mockupMobile = async (engine: CreativeEngine, data?: Business) => {
  const scene = engine.scene.get()
  if (scene === null || scene === undefined) {
    throw new Error('Scene not found.')
  }
  const pages = engine.block.findByType(DesignBlockType.Page)
  const page = pages[0]
  // change page background image
  const primaryColor = data?.secondaryColor || '#fff'
  const primaryColorRgba = hextToRgbRanged(primaryColor)
  const solidColor = engine.block.createFill('color')
  engine.block.setColorRGBA(
    solidColor,
    'color/value',
    primaryColorRgba.r,
    primaryColorRgba.g,
    primaryColorRgba.b,
    primaryColorRgba.a
  )
  engine.block.setFill(page, solidColor)
  // change image mockup
  const mockup = engine.block.findByType(DesignBlockType.Image)[0]
  const mockupImage = data?.niche?.productMockups?.[0]?.mobileMockups?.[0]?.url
  engine.block.setContentFillMode(mockup, 'Contain')
  engine.block.setString(mockup, 'image/imageFileURI', mockupImage || 'https://i.imgur.com/TyUybFZ.png')
  const options = { pngCompressionLevel: 5 }
  const blob = await engine.block.export(scene, MimeType.Png, options)
  const blobUrl = URL.createObjectURL(blob)
  return blobUrl
}

export const plainImage = async (engine: CreativeEngine, data?: Business) => {
  const scene = engine.scene.get()
  if (scene === null || scene === undefined) {
    throw new Error('Scene not found.')
  }
  // change image mockup
  const mockup = engine.block.findByType(DesignBlockType.Image)[0]
  const mockupImage = data?.niche?.productMockups?.[0]?.mockups?.[1]?.url
  engine.block.setContentFillMode(mockup, 'Cover')
  engine.block.setString(mockup, 'image/imageFileURI', mockupImage || '')
  const options = { pngCompressionLevel: 5 }
  const blob = await engine.block.export(scene, MimeType.Png, options)
  const blobUrl = URL.createObjectURL(blob)
  return blobUrl
}

export const mobileDesktopAds = async (engine: CreativeEngine, data?: Business) => {
  const scene = engine.scene.get()
  if (scene === null || scene === undefined) {
    throw new Error('Scene not found.')
  }
  const pages = engine.block.findByType(DesignBlockType.Page)
  const page = pages[0]
  // change page background image
  const primaryColor = data?.primaryColor || '#fff'
  const primaryColorRgba = hextToRgbRanged(primaryColor)
  const secondaryColor = data?.secondaryColor || '#fff'
  const secondaryColorRgba = hextToRgbRanged(secondaryColor)
  const solidSecondaryColor = engine.block.createFill('color')
  const solidPrimaryColor = engine.block.createFill('color')
  engine.block.setColorRGBA(
    solidPrimaryColor,
    'color/value',
    primaryColorRgba.r,
    primaryColorRgba.g,
    primaryColorRgba.b,
    primaryColorRgba.a
  )
  engine.block.setFill(page, solidPrimaryColor)

  // set button backgroundColor
  const button = engine.block.findByType(DesignBlockType.RectShape)[0]
  engine.block.setColorRGBA(
    solidSecondaryColor,
    'color/value',
    secondaryColorRgba.r,
    secondaryColorRgba.g,
    secondaryColorRgba.b
  )
  engine.block.setStrokeColorRGBA(button, secondaryColorRgba.r, secondaryColorRgba.g, secondaryColorRgba.b)
  engine.block.setFill(button, solidSecondaryColor)

  // change all variables with tagcopies
  const tagCopies = getTagCopies(data)
  tagCopies.copyFrom?.forEach((from: any, index: number) => {
    engine.variable.setString(from, tagCopies.copyTo?.[index])
  })
  const mockup = engine.block.findByType(DesignBlockType.Image)[0]
  const mockupImage = data?.niche?.productMockups?.[0]?.desktopMockups?.[0]?.url
  engine.block.setContentFillMode(mockup, 'Contain')
  engine.block.setString(mockup, 'image/imageFileURI', mockupImage || 'https://i.imgur.com/NrDY9WO.png')

  const options = { pngCompressionLevel: 5, targetWidth: 800, targetHeight: 1700 }
  const blob = await engine.block.export(scene, MimeType.Png, options)
  const blobUrl = URL.createObjectURL(blob)
  return blobUrl
}

export const mobileMobileAds = async (engine: CreativeEngine, data?: Business) => {
  const scene = engine.scene.get()
  if (scene === null || scene === undefined) {
    throw new Error('Scene not found.')
  }
  const pages = engine.block.findByType(DesignBlockType.Page)
  const page = pages[0]
  // change page background image
  const primaryColor = data?.primaryColor || '#fff'
  const primaryColorRgba = hextToRgbRanged(primaryColor)
  const secondaryColor = data?.secondaryColor || '#fff'
  const secondaryColorRgba = hextToRgbRanged(secondaryColor)
  const solidSecondaryColor = engine.block.createFill('color')
  const solidPrimaryColor = engine.block.createFill('color')
  engine.block.setColorRGBA(
    solidPrimaryColor,
    'color/value',
    primaryColorRgba.r,
    primaryColorRgba.g,
    primaryColorRgba.b,
    primaryColorRgba.a
  )
  engine.block.setFill(page, solidPrimaryColor)

  // set button backgroundColor
  const button = engine.block.findByType(DesignBlockType.RectShape)[0]
  engine.block.setColorRGBA(
    solidSecondaryColor,
    'color/value',
    secondaryColorRgba.r,
    secondaryColorRgba.g,
    secondaryColorRgba.b
  )
  engine.block.setStrokeColorRGBA(button, secondaryColorRgba.r, secondaryColorRgba.g, secondaryColorRgba.b)
  engine.block.setFill(button, solidSecondaryColor)

  // loop text type
  const tagCopies = getTagCopies(data)
  tagCopies.copyFrom?.forEach((from: any, index: number) => {
    engine.variable.setString(from, tagCopies.copyTo?.[index])
  })

  const mockup = engine.block.findByType(DesignBlockType.Image)[0]
  const mockupImage = data?.niche?.productMockups?.[0]?.mobileMockups?.[0]?.url
  engine.block.setContentFillMode(mockup, 'Contain')
  engine.block.setString(mockup, 'image/imageFileURI', mockupImage || 'https://i.imgur.com/NrDY9WO.png')

  const options = { pngCompressionLevel: 5, targetWidth: 800, targetHeight: 1700 }
  const blob = await engine.block.export(scene, MimeType.Png, options)
  const blobUrl = URL.createObjectURL(blob)
  return blobUrl
}
