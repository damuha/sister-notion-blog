import { NOTION_API_SECRET, DATABASE_ID } from './server-constants'
const { Client } = require('@notionhq/client')

const client = new Client({
  auth: NOTION_API_SECRET,
})

interface Post {
  PageId: string
  Title: string
  Slug: string
  Date: string
  Tags: string[]
  //   Excerpt: string
  //   OGImage: string
}

interface Block {
  Id: string
  Type: string
  HasChildren: boolean
  RichTexts?: RichText[]
  Image?: Image
  Code?: Code
  Quote?: Quote
  Callout?: Callout
  Embed?: Embed
  Bookmark?: Bookmark
  LinkPreview?: LinkPreview
  Table?: Table
  TableRow?: TableRow
}
interface Image {
  Caption: RichText[]
  Type: string
  File: File
}

interface File {
  Url: string
}

interface Code {
  Text: RichText[]
  Language: string
}

interface Quote {
  Text: RichText[]
}

interface Callout {
  RichTexts: RichText[]
  Icon: Icon
}

interface Embed {
  Url: string
}

interface Bookmark {
  Url: string
}

interface LinkPreview {
  Url: string
}

interface Table {
  TableWidth: number
  HasColumnHeader: boolean
  HasRowHeader: boolean
  Rows: Block[]
}

interface TableRow {
  Cells: TableCell[]
}

interface TableCell {
  RichTexts: RichText[]
}

interface RichText {
  Text: Text
  Annotation: Annotation
  PlainText: string
  Href?: string
}

interface Text {
  Content: string
  Link?: Link
}

interface Icon {
  Emoji: string
}

interface Annotation {
  Bold: boolean
  Italic: boolean
  Strikethrough: boolean
  Underline: boolean
  Code: boolean
  Color: string
}

interface Link {
  Url: string
}

export async function getPosts(pageSize: number = 10, cursor?: string) {
  let params = {
    database_id: DATABASE_ID,
    filter: {
      and: [
        {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
        {
          property: 'Date',
          date: {
            on_or_before: new Date().toISOString(),
          },
        },
      ],
    },
    sorts: [
      {
        property: 'Date',
        timestamp: 'created_time',
        direction: 'descending',
      },
    ],
    page_size: pageSize,
  }

  if (!!cursor) {
    params['start_cursor'] = cursor
  }
  console.log(params)
  const data = await client.databases.query(params)

  return data.results.map((item) => {
    const prop = item.properties

    const post: Post = {
      PageId: item.id,
      Title: prop.Page.title[0].plain_text,
      Slug: prop.Slug.rich_text[0].plain_text,
      Date: prop.Date.date.start,
      Tags: prop.Tags.multi_select.map((opt) => opt.name),
      //   Excerpt: prop.Excerpt.rich_text[0].plain_text,
      //   OGImage:
      //     prop.OGImage.files.length > 0 ? prop.OGImage.files[0].name : null,
    }

    return post
  })
}

export async function getAllPosts() {
  let allPosts: Post[] = []

  let params = {
    database_id: DATABASE_ID,
    filter: {
      and: [
        {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
        {
          property: 'Date',
          date: {
            on_or_before: new Date().toISOString(),
          },
        },
      ],
    },
    sorts: [
      {
        property: 'Date',
        timestamp: 'created_time',
        direction: 'descending',
      },
    ],
    page_size: 100,
  }

  while (true) {
    const data = await client.databases.query(params)

    const posts = data.results.map((item) => {
      const prop = item.properties

      const post: Post = {
        PageId: item.id,
        Title: prop.Page.title[0].plain_text,
        Slug: prop.Slug.rich_text[0].plain_text,
        Date: prop.Date.date.start,
        Tags: prop.Tags.multi_select.map((opt) => opt.name),
        // Excerpt: prop.Excerpt.rich_text[0].plain_text,
        // OGImage:
        //   prop.OGImage.files.length > 0 ? prop.OGImage.files[0].name : null,
      }

      return post
    })

    allPosts = allPosts.concat(posts)

    if (!data.has_more) {
      break
    }

    params['start_cursor'] = data.next_cursor
  }

  return allPosts
}

export async function getPostBySlug(slug: string) {
  const data = await client.databases.query({
    database_id: DATABASE_ID,
    filter: {
      and: [
        {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
        {
          property: 'Date',
          date: {
            on_or_before: new Date().toISOString(),
          },
        },
        {
          property: 'Slug',
          text: {
            equals: slug,
          },
        },
      ],
    },
    sorts: [
      {
        property: 'Date',
        timestamp: 'created_time',
        direction: 'ascending',
      },
    ],
  })

  const result = data.results[0]
  const prop = result.properties

  const post: Post = {
    PageId: result.id,
    Title: prop.Page.title[0].plain_text,
    Slug: prop.Slug.rich_text[0].plain_text,
    Date: prop.Date.date.start,
    Tags: prop.Tags.multi_select.map((opt) => opt.name),
    // Excerpt: prop.Excerpt.rich_text[0].plain_text,
    // OGImage: prop.OGImage.files.length > 0 ? prop.OGImage.files[0].name : null,
  }

  return post
}

export async function getPostsByTag(tag: string, cursor?: string) {
  let params = {
    database_id: DATABASE_ID,
    filter: {
      and: [
        {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
        {
          property: 'Date',
          date: {
            on_or_before: new Date().toISOString(),
          },
        },
        {
          property: 'Tags',
          multi_select: {
            contains: tag,
          },
        },
      ],
    },
    sorts: [
      {
        property: 'Date',
        timestamp: 'created_time',
        direction: 'descending',
      },
    ],
  }

  if (!!cursor) {
    params['start_cursor'] = cursor
  }

  const data = await client.databases.query(params)

  return data.results.map((item) => {
    const prop = item.properties

    const post: Post = {
      PageId: item.id,
      Title: prop.Page.title[0].plain_text,
      Slug: prop.Slug.rich_text[0].plain_text,
      Date: prop.Date.date.start,
      Tags: prop.Tags.multi_select.map((opt) => opt.name),
      //   Excerpt: prop.Excerpt.rich_text[0].plain_text,
      //   OGImage:
      //     prop.OGImage.files.length > 0 ? prop.OGImage.files[0].name : null,
    }

    return post
  })
}

export async function getAllBlocksByBlockId(blockId) {
  let allBlocks: Block[] = []

  let params = {
    block_id: blockId,
  }

  while (true) {
    const data = await client.blocks.children.list(params)

    const blocks = data.results.map((item) => {
      let block = null

      switch (item.type) {
        case 'paragraph':
        case 'heading_1':
        case 'heading_2':
        case 'heading_3':
        case 'bulleted_list_item':
        case 'numbered_list_item':
          block = {
            Id: item.id,
            Type: item.type,
            HasChildren: item.has_children,
            RichTexts: item[item.type].text.map((item) => {
              const text: Text = {
                Content: item.text.content,
                Link: item.text.link,
              }

              const annotation: Annotation = {
                Bold: item.annotations.bold,
                Italic: item.annotations.italic,
                Strikethrough: item.annotations.strikethrough,
                Underline: item.annotations.underline,
                Code: item.annotations.code,
                Color: item.annotations.color,
              }

              const richText: RichText = {
                Text: text,
                Annotation: annotation,
                PlainText: item.plain_text,
                Href: item.href,
              }

              return richText
            }),
          }
          break
        case 'image':
          const image: Image = {
            Caption: item.image.caption.map((item) => {
              const text: Text = {
                Content: item.text.content,
                Link: item.text.link,
              }

              const annotation: Annotation = {
                Bold: item.annotations.bold,
                Italic: item.annotations.italic,
                Strikethrough: item.annotations.strikethrough,
                Underline: item.annotations.underline,
                Code: item.annotations.code,
                Color: item.annotations.color,
              }

              const richText: RichText = {
                Text: text,
                Annotation: annotation,
                PlainText: item.plain_text,
                Href: item.href,
              }

              return richText
            }),
            Type: item.image.type,
            File: {
              Url: item.image.file.url,
            },
          }

          block = {
            Id: item.id,
            Type: item.type,
            HasChildren: item.has_children,
            Image: image,
          }
          break
        case 'code':
          const code: Code = {
            Text: item[item.type].text.map((item) => {
              const text: Text = {
                Content: item.text.content,
                Link: item.text.link,
              }

              const annotation: Annotation = {
                Bold: item.annotations.bold,
                Italic: item.annotations.italic,
                Strikethrough: item.annotations.strikethrough,
                Underline: item.annotations.underline,
                Code: item.annotations.code,
                Color: item.annotations.color,
              }

              const richText: RichText = {
                Text: text,
                Annotation: annotation,
                PlainText: item.plain_text,
                Href: item.href,
              }

              return richText
            }),
            Language: item.code.language,
          }

          block = {
            Id: item.id,
            Type: item.type,
            HasChildren: item.has_children,
            Code: code,
          }
          break
        case 'quote':
          const quote: Quote = {
            Text: item[item.type].text.map((item) => {
              const text: Text = {
                Content: item.text.content,
                Link: item.text.link,
              }

              const annotation: Annotation = {
                Bold: item.annotations.bold,
                Italic: item.annotations.italic,
                Strikethrough: item.annotations.strikethrough,
                Underline: item.annotations.underline,
                Code: item.annotations.code,
                Color: item.annotations.color,
              }

              const richText: RichText = {
                Text: text,
                Annotation: annotation,
                PlainText: item.plain_text,
                Href: item.href,
              }

              return richText
            }),
          }

          block = {
            Id: item.id,
            Type: item.type,
            HasChildren: item.has_children,
            Quote: quote,
          }
          break
        case 'callout':
          const callout: Callout = {
            RichTexts: item[item.type].text.map((item) => {
              const text: Text = {
                Content: item.text.content,
                Link: item.text.link,
              }

              const annotation: Annotation = {
                Bold: item.annotations.bold,
                Italic: item.annotations.italic,
                Strikethrough: item.annotations.strikethrough,
                Underline: item.annotations.underline,
                Code: item.annotations.code,
                Color: item.annotations.color,
              }

              const richText: RichText = {
                Text: text,
                Annotation: annotation,
                PlainText: item.plain_text,
                Href: item.href,
              }

              return richText
            }),
            Icon: {
              Emoji: item[item.type].icon.emoji,
            },
          }

          block = {
            Id: item.id,
            Type: item.type,
            HasChildren: item.has_children,
            Callout: callout,
          }
          break
        case 'embed':
          const embed: Embed = {
            Url: item.embed.url,
          }

          block = {
            Id: item.id,
            Type: item.type,
            HasChildren: item.has_children,
            Embed: embed,
          }
          break
        case 'bookmark':
          const bookmark: Bookmark = {
            Url: item.bookmark.url,
          }

          block = {
            Id: item.id,
            Type: item.type,
            HasChildren: item.has_children,
            Bookmark: bookmark,
          }
          break
        case 'link_preview':
          const linkPreview: LinkPreview = {
            Url: item.link_preview.url,
          }

          block = {
            Id: item.id,
            Type: item.type,
            HasChildren: item.has_children,
            LinkPreview: linkPreview,
          }
          break
        case 'table':
          const table: Table = {
            TableWidth: item.table.table_width,
            HasColumnHeader: item.table.has_column_header,
            HasRowHeader: item.table.has_row_header,
            Rows: [],
          }

          block = {
            Id: item.id,
            Type: item.type,
            HasChildren: item.has_children,
            Table: table,
          }
          break
        case 'table_row':
          const cells: TableCell[] = item.table_row.cells.map((cell) => {
            const tableCell: TableCell = {
              RichTexts: cell.map((item) => {
                const text: Text = {
                  Content: item.text.content,
                  Link: item.text.link,
                }

                const annotation: Annotation = {
                  Bold: item.annotations.bold,
                  Italic: item.annotations.italic,
                  Strikethrough: item.annotations.strikethrough,
                  Underline: item.annotations.underline,
                  Code: item.annotations.code,
                  Color: item.annotations.color,
                }

                const richText: RichText = {
                  Text: text,
                  Annotation: annotation,
                  PlainText: item.plain_text,
                  Href: item.href,
                }

                return richText
              }),
            }

            return tableCell
          })

          const tableRow: TableRow = {
            Cells: cells,
          }

          block = {
            Id: item.id,
            Type: item.type,
            HasChildren: item.has_children,
            TableRow: tableRow,
          }
          break
        default:
          block = {
            Id: item.id,
            Type: item.type,
            HasChildren: item.has_children,
          }
          break
      }

      return block
    })

    allBlocks = allBlocks.concat(blocks)

    if (!data.has_more) {
      break
    }

    params['start_cursor'] = data.next_cursor
  }

  for (let i = 0; i < allBlocks.length; i++) {
    let block = allBlocks[i]

    if (block.Type === 'table') {
      // Fetch table_row
      block.Table.Rows = await getAllBlocksByBlockId(block.Id)
    }
  }

  return allBlocks
}

export async function getAllTags() {
  const data = await client.databases.retrieve({
    database_id: DATABASE_ID,
  })
  return data.properties.Tags.multi_select.options.map((option) => option.name)
}
