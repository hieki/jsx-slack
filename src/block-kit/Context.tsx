/** @jsx JSXSlack.h */
import { ContextBlock, ImageElement, MrkdwnElement } from '@slack/client'
import { JSXSlack } from '../jsx'
import html from '../html'
import { ObjectOutput } from '../utils'
import { BlockComponentProps } from './Block'

const endSymbol = Symbol('EndOfContext')

export const Context: JSXSlack.FC<
  BlockComponentProps & { children: JSXSlack.Children<{}> }
> = ({ blockId, children, id }) => {
  const elements: (ImageElement | MrkdwnElement)[] = []
  let current: (string | JSXSlack.Node)[] = []

  for (const child of [...JSXSlack.normalizeChildren(children), endSymbol]) {
    const img =
      child && typeof child === 'object' && child.type === 'img'
        ? child
        : undefined

    if (current.length > 0 && (img || child === endSymbol)) {
      // Text content
      elements.push({ type: 'mrkdwn', text: html(current), verbatim: false })
      current = []
    }

    if (img) {
      // Image content
      elements.push({
        type: 'image',
        image_url: img.props.src,
        alt_text: img.props.alt,
      })
    } else if (typeof child !== 'symbol') {
      current.push(child)
    }
  }

  if (elements.length > 10)
    throw new Error(
      `The number of elements generated by <Context> is ${
        elements.length
      }. It's going over the limit. (10)`
    )

  return (
    <ObjectOutput<ContextBlock>
      type="context"
      block_id={id || blockId}
      elements={elements}
    />
  )
}