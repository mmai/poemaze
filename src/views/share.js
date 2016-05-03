import { h } from 'cycle-snabbdom'

function stripHtml (html) {
  var tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export function renderShare (href, content) {
  const twitterContent = encodeURIComponent(stripHtml(`${content} ${href}`))
  const mailContent = encodeURIComponent(stripHtml(`${content} ${href}`))
  return h('div.share', [
    h('button.share-btn.trigger.reset', {attrs: {type: 'button', 'onclick': "document.getElementById('share-panel').classList.toggle('active')" }}, 'Share'),
    h('div#share-panel', [
      h('a', {attrs: {title: 'Share on Facebook', target: '_blank', href: `https://www.facebook.com/sharer/sharer.php?u=${href}` }}, [
        h('svg', {attrs: {width: '24', height: '28', viewBox: '0 0 24 28'}}, [
          h('path', {attrs: {d: 'M19.5 2q1.859 0 3.18 1.32t1.32 3.18v15q0 1.859-1.32 3.18t-3.18 1.32h-2.938v-9.297h3.109l0.469-3.625h-3.578v-2.312q0-0.875 0.367-1.313t1.43-0.438l1.906-0.016v-3.234q-0.984-0.141-2.781-0.141-2.125 0-3.398 1.25t-1.273 3.531v2.672h-3.125v3.625h3.125v9.297h-8.313q-1.859 0-3.18-1.32t-1.32-3.18v-15q0-1.859 1.32-3.18t3.18-1.32h15z'}})
        ]),
      ]),
      h('a', {attrs: {title: 'Share on Twitter', target: '_blank', href: `https://twitter.com/home?status=${twitterContent}`}}, [
        h('svg', {attrs: {width: '24', height: '28', viewBox: '0 0 24 28'}}, [
          h('path', {attrs: {d: 'M20 9.531q-0.875 0.391-1.891 0.531 1.062-0.625 1.453-1.828-1.016 0.594-2.094 0.797-0.953-1.031-2.391-1.031-1.359 0-2.32 0.961t-0.961 2.32q0 0.453 0.078 0.75-2.016-0.109-3.781-1.016t-3-2.422q-0.453 0.781-0.453 1.656 0 1.781 1.422 2.734-0.734-0.016-1.563-0.406v0.031q0 1.172 0.781 2.086t1.922 1.133q-0.453 0.125-0.797 0.125-0.203 0-0.609-0.063 0.328 0.984 1.164 1.625t1.898 0.656q-1.813 1.406-4.078 1.406-0.406 0-0.781-0.047 2.312 1.469 5.031 1.469 1.75 0 3.281-0.555t2.625-1.484 1.883-2.141 1.172-2.531 0.383-2.633q0-0.281-0.016-0.422 0.984-0.703 1.641-1.703zM24 6.5v15q0 1.859-1.32 3.18t-3.18 1.32h-15q-1.859 0-3.18-1.32t-1.32-3.18v-15q0-1.859 1.32-3.18t3.18-1.32h15q1.859 0 3.18 1.32t1.32 3.18z'}})
        ])
      ]),
      h('a', {attrs: {title: 'Share by email', href: `mailto:enter@address-here.com?subject=Binary Shakespeare&body=${mailContent}` }}, [
        h('svg', {attrs: {width: '24', height: '28', viewBox: '0 0 24 28'}}, [
          h('path', {attrs: {d: 'M19.5 2q1.859 0 3.18 1.32t1.32 3.18v15q0 1.859-1.32 3.18t-3.18 1.32h-15q-1.859 0-3.18-1.32t-1.32-3.18v-15q0-1.859 1.32-3.18t3.18-1.32h15zM20 18.5v-6.813q-0.484 0.547-1 0.859-0.531 0.344-2.070 1.328t-2.367 1.547q-1.531 1.078-2.562 1.078v0 0q-1.031 0-2.562-1.078-0.719-0.5-2.211-1.445t-2.227-1.445q-0.187-0.125-0.516-0.422t-0.484-0.422v6.813q0 0.625 0.438 1.062t1.062 0.438h13q0.625 0 1.062-0.438t0.438-1.062zM20 9.547q0-0.641-0.43-1.094t-1.070-0.453h-13q-0.625 0-1.062 0.438t-0.438 1.062q0 0.578 0.477 1.195t1.055 1.008q0.734 0.5 2.148 1.391t2.023 1.297q0.047 0.031 0.266 0.18t0.328 0.219 0.328 0.203 0.367 0.203 0.336 0.148 0.352 0.117 0.32 0.039 0.32-0.039 0.352-0.117 0.336-0.148 0.367-0.203 0.328-0.203 0.328-0.219 0.266-0.18l4.172-2.719q0.547-0.359 1.039-0.977t0.492-1.148z'}})
        ])
      ])
    ])
  ])
}
