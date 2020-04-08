import puppeteer from 'puppeteer'
import { expect } from 'chai'
import {
  URL,
  addEmailTag,
  assertEmailTagCount,
} from './test-utils'

describe('Unique Email Tags Input', () => {
  let browser
  let page
  const tagsInputFieldSelector = '.tagsinput'

  beforeAll(async () => {
    browser = await puppeteer.launch(browserOptions)
  })

  afterAll(async () => {
    await browser.close()
  })

  beforeEach(async () => {
    page = await browser.newPage()
    await page.goto(`${URL}/unique`)
  })

  afterEach(async () => {
    await page.close()
  })

  it('should render editor', async () => {
    const editor = await page.waitForSelector(tagsInputFieldSelector)
    expect(editor).to.exist
  })

  describe('user typing different email edge cases', () => {
    const uniqueEmailExamples = [
      "single'123@quote.aa",
      'withcu{}ly@bracket.go',
    ]

    it('should be allowed to add unique email tag', async () => {
      let tagCount = 0
      for (const testEmail of uniqueEmailExamples) {
        await addEmailTag(page, testEmail)
        await assertEmailTagCount(page, ++tagCount)
      }
    })

    it('should not be allowed to add same email tag again', async () => {
      await addEmailTag(page, uniqueEmailExamples[0])
      await assertEmailTagCount(page, 1)
      await addEmailTag(page, uniqueEmailExamples[0])
      await assertEmailTagCount(page, 1)
    })
  })
})
