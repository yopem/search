import { NextResponse } from "next/server"

import { siteDescription, siteTitle } from "@/lib/env/client"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`
  const searchUrl = `${baseUrl}/search?q={searchTerms}`

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${siteTitle}</ShortName>
  <Description>${siteDescription}</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/svg+xml">${baseUrl}/favicon.svg</Image>
  <Url type="text/html" method="get" template="${searchUrl}">
    <Param name="q" value="{searchTerms}"/>
  </Url>
</OpenSearchDescription>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/opensearchdescription+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  })
}
