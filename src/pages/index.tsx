import Link from 'next/link'
import Header from '../components/header'
import Share from '../components/share'

import blogStyles from '../styles/blog.module.css'
import sharedStyles from '../styles/shared.module.css'

import {
  getBlogLink,
  getTagLink,
  getDateStr,
  postIsPublished,
} from '../lib/blog-helpers'
import { textBlock } from '../lib/notion/renderers'
import getNotionUsers from '../lib/notion/getNotionUsers'
import getBlogIndex from '../lib/notion/getBlogIndex'

export async function getStaticProps({ preview }) {
  const postsTable = await getBlogIndex()

  const authorsToGet: Set<string> = new Set()
  const posts: any[] = Object.keys(postsTable)
    .map((slug) => {
      const post = postsTable[slug]
      // remove draft posts in production
      if (!preview && !postIsPublished(post)) {
        return null
      }
      post.Authors = post.Authors || []
      for (const author of post.Authors) {
        authorsToGet.add(author)
      }
      return post
    })
    .filter(Boolean)

  const tags: string[] = Object.keys(postsTable)
    .filter((slug) => postIsPublished(postsTable[slug]))
    .map((slug) => postsTable[slug].Tags)
    .flat()
    .filter((tag, index, self) => self.indexOf(tag) === index)

  const { users } = await getNotionUsers([...authorsToGet])

  posts.map((post) => {
    post.Authors = post.Authors.map((id) => users[id].full_name)
  })

  return {
    props: {
      preview: preview || false,
      posts,
      tags,
    },
    revalidate: 10,
  }
}

const Index = ({ posts = [], tags = [], preview }) => {
  return (
    <>
      <Header titlePre="Blog" />
      {preview && (
        <div className={blogStyles.previewAlertContainer}>
          <div className={blogStyles.previewAlert}>
            <b>Note:</b>
            {` `}Viewing in preview mode{' '}
            <Link href={`/api/clear-preview`}>
              <button className={blogStyles.escapePreview}>Exit Preview</button>
            </Link>
          </div>
        </div>
      )}
      <div className={`${sharedStyles.layout} ${blogStyles.blogIndex}`}>
        <div
          style={{
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Share
            text={`sister（シスター）のブログ #sisterwith`}
            url={`https://blog.sisterwith.com`}
          />
        </div>
        <h1>sister</h1>
        <img
          src="/big-sister.png"
          height="85"
          width="100"
          alt="Vercel + Notion"
        />
        {posts.length === 0 && (
          <p className={blogStyles.noPosts}>記事がまだありません</p>
        )}
        {posts.map((post) => {
          return (
            <div className={blogStyles.postPreview} key={post.Slug}>
              <h3>
                <span className={blogStyles.titleContainer}>
                  {!post.Published && (
                    <span className={blogStyles.draftBadge}>Draft</span>
                  )}
                  <Link href="/blog/[slug]" as={getBlogLink(post.Slug)}>
                    <a>{post.Page}</a>
                  </Link>
                </span>
              </h3>
              {/* {post.Authors.length > 0 && (
                <div className={blogStyles.subText}>By: {post.Authors.join(' ')}</div>
              )} */}
              <div className={blogStyles.flex}>
                {post.Tags &&
                  post.Tags.length > 0 &&
                  post.Tags.map((tag) => (
                    <Link
                      href="/blog/tag/[tag]"
                      as={getTagLink(tag)}
                      key={`${post.Slug}-${tag}`}
                      passHref
                    >
                      <div className={blogStyles.tag}>
                        <a>{tag}</a>
                      </div>
                    </Link>
                  ))}
              </div>
              {post.Date && (
                <div className={blogStyles.subText}>
                  {getDateStr(post.Date)}
                </div>
              )}
              <p className={blogStyles.subText}>
                {(!post.preview || post.preview.length === 0) && ''}
                {(post.preview || []).map((block, idx) =>
                  textBlock(block, true, `${post.Slug}${idx}`)
                )}
              </p>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default Index
