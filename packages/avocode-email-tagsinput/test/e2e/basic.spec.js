import puppeteer from 'puppeteer'
import { expect } from 'chai'
import {
  URL,
  tagSubmitKeys,
  tagsInputFieldSelector,
  getAnchorAndFocus,
  addEmailTag,
  assertEmailTagCount,
  assertInputText,
} from './test-utils'

describe('Basic Email Tags Input', () => {
  let browser
  let page

  beforeAll(async () => {
    browser = await puppeteer.launch(browserOptions)
  })

  beforeEach(async () => {
    page = await browser.newPage()
    await page.goto(URL)
  })

  afterEach(async () => {
    await page.close()
  })

  afterAll(async () => {
    await browser.close()
  })

  it('should render editor', async () => {
    const editor = await page.waitForSelector(tagsInputFieldSelector)
    expect(editor).to.exist
  })

  describe('user typing', () => {
    it('should insert text', async () => {
      await page.click(tagsInputFieldSelector)
      await page.type(tagsInputFieldSelector, 'abcd')
      await assertInputText(page, 'abcd')
    })

    it('should delete text with backspace', async () => {
      await page.click(tagsInputFieldSelector)
      await page.type(tagsInputFieldSelector, 'abcd')
      await page.keyboard.press('Backspace')
      await assertInputText(page, 'abc')
    })

    it('should delete text with delete', async () => {
      await page.click(tagsInputFieldSelector)
      await page.type(tagsInputFieldSelector, 'abcd')
      await page.keyboard.press('ArrowLeft')
      await page.keyboard.press('Delete')
      await assertInputText(page, 'abc')
    })

    it('should navigate one char left', async () => {
      await page.click(tagsInputFieldSelector)
      await page.type(tagsInputFieldSelector, 'abcd')
      await page.keyboard.press('ArrowLeft')
      const [ anchorOffset ] = await getAnchorAndFocus(page)
      expect(anchorOffset).to.equal(3)
    })
  })

  describe('user typing different email edge cases', () => {
    const unsupportedEmailEdgeCases = [
      'double"123@quotes.co',
      'withb[]g@bracket.com',
      'withsm()ll@bracket.com',
    ]
    const supportedEmailEdgeCases = [
      "single'123@quote.co",
      'withcu{}ly@bracket.co',
      'सिमप्लेफोल्देर$%#?&@nepali.co',
    ]

    for (const testEmail of unsupportedEmailEdgeCases) {
      it(`should not be allowed to add ${testEmail} as an email tag`, async () => {
        await addEmailTag(page, testEmail)
        await assertEmailTagCount(page, 0)
      })
    }

    for (const testEmail of supportedEmailEdgeCases) {
      it(`should not be allowed to add ${testEmail} as an email tag`, async () => {
        await addEmailTag(page, testEmail)
        await assertEmailTagCount(page, 1)
      })
    }

    it('should be possible to add email tags with full numeric local-part', async () => {
      const testEmail = '1234@test.co'
      await addEmailTag(page, testEmail)
      await assertEmailTagCount(page, 1)
    })
  })

  describe('user can add new tag typing valid email and hitting comma, enter or space', () => {
    for (const hittingKey of tagSubmitKeys) {
      it(`should be possible to add an email tag hitting ${hittingKey}`, async () => {
        const validEmailTag = 'test@ex.com'
        await addEmailTag(page, validEmailTag)
        await assertEmailTagCount(page, 1, hittingKey)
      })
    }
  })
})
