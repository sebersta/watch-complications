export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    if (url.pathname !== '/1st_floor_ocean.json') {
      return new Response('Not found', { status: 404 })
    }

    const cacheKey = '1st_floor_ocean_data'

    // Check KV first
    const cached = await env.WAITZ_KV.get(cacheKey)
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      })
    }

    // Fetch fresh data
    const res = await fetch('https://www.waitz.io/live/ucsb')
    const json = await res.json()

    let target = null
    for (const loc of json.data) {
      for (const sub of loc.subLocs || []) {
        if (sub.name === '1st Floor Ocean') {
          target = sub
          break
        }
      }
      if (target) break
    }

    if (!target) {
      return new Response('Sublocation not found', { status: 500 })
    }

    const people = target.people
    const capacity = target.capacity
    const percent = Math.round(target.percentage * 100)
    const name = target.name

    const result = {
      name,
      showOnLockScreen: true,
      views: [
        {
          type: 'text',
          body: `Status: Not Busy\n${people} People\nCapacity: ${capacity}`
        },
        {
          type: 'text',
          body: `Filled: ${percent}%\nOpen Now\nLocation: UCSB Library`
        }
      ],
      families: [
        {
          family: 'graphicCircular',
          class: 'CLKComplicationTemplateGraphicCircularStackText',
          line1: '1st Flr',
          line2: `${percent}%`
        },
        {
          family: 'circularSmall',
          class: 'CLKComplicationTemplateCircularSmallStackText',
          line1: 'Ocean',
          line2: `${percent}%`
        },
        {
          family: 'modularSmall',
          class: 'CLKComplicationTemplateModularSmallStackText',
          line1: 'People',
          line2: `${people}`
        },
        {
          family: 'modularLarge',
          class: 'CLKComplicationTemplateModularLargeStandardBody',
          header: name,
          body1: `People: ${people}`,
          body2: `Cap: ${capacity} (${percent}%)`
        },
        {
          family: 'graphicCorner',
          class: 'CLKComplicationTemplateGraphicCornerStackText',
          innerText: `${people} People`,
          outerText: 'Ocean Floor'
        },
        {
          family: 'graphicBezel',
          class: 'CLKComplicationTemplateGraphicBezelCircularText',
          line1: 'Ocean',
          line2: `${percent}%`,
          text: '1st Floor'
        },
        {
          family: 'utilitarianSmall',
          class: 'CLKComplicationTemplateUtilitarianSmallFlat',
          text: `Ocean ${percent}%`
        },
        {
          family: 'utilitarianLarge',
          class: 'CLKComplicationTemplateUtilitarianLargeFlat',
          text: `${name} - ${percent}%`
        },
        {
          family: 'graphicRectangular',
          class: 'CLKComplicationTemplateGraphicRectangularStandardBody',
          header: 'Ocean Floor',
          body1: `${people} People`,
          body2: `Capacity ${capacity}`
        }
      ]
    }

    const payload = JSON.stringify(result)

    // Save to KV for 5 minutes
    await env.WAITZ_KV.put(cacheKey, payload, { expirationTtl: 300 })

    return new Response(payload, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    })
  }
}
