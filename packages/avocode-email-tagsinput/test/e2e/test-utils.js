import { expect } from 'chai'

const tagsInputFieldSelector = '.tagsinput'
const tagSubmitKeys = [ 'Comma', 'Enter', 'Space' ]
const URL = isDevelopment
  ? 'http://localhost:8080/#/avocode-email-tagsinput'
  : 'https://avocode-email-tagsinput.surge.sh/#/avocode-email-tagsinput'

const getInputText = async (page, selector = tagsInputFieldSelector) => {
  const text = await page.evaluate((selector) => {
    const editor = document.querySelector(selector)

    return editor.textContent
  }, selector)

  return text.trim()
}

const getTagNodes = async (page, selector = tagsInputFieldSelector) => {
  return await page.evaluate((selector) => {
    const editor = document.querySelector(selector)
    const tagNodes = editor.querySelectorAll('.tag')

    return Array.from(tagNodes)
      .map((node) => {
        return {
          text: node.textContent.trim(),
          className: node.className,
          html: node.innerHTML,
        }
      })
  }, selector)
}


const getAnchorAndFocus = async (page) => {
  const anchorAndFocus = await page.evaluate(() => {
    const selection = window.getSelection()

    return [ selection.anchorOffset, selection.focusOffset ]
  })

  return anchorAndFocus
}

const addEmailTag = async (page, emailTag, submitKey = 'Comma') => {
  await page.click(tagsInputFieldSelector)
  await page.type(tagsInputFieldSelector, emailTag)
  if (tagSubmitKeys.includes(submitKey)) {
    await page.keyboard.press(submitKey)
  } else {
    throw new Error(`invalid submit key provided. Expected ${
      tagSubmitKeys.toString()}, but found: ${submitKey}`
    )
  }
}

const assertEmailTagCount = async function (page, expectedCount) {
  const tagNodes = await getTagNodes(page)
  expect(tagNodes).to.have.length(expectedCount)
}

const assertInputText = async function (page, expectedText) {
  const text = await getInputText(page)
  expect(text).to.equal(expectedText)
}

export {
  URL,
  tagSubmitKeys,
  tagsInputFieldSelector,
  addEmailTag,
  getTagNodes,
  getInputText,
  assertInputText,
  getAnchorAndFocus,
  assertEmailTagCount,
}

