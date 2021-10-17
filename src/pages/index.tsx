import Link from 'next/link'
import Header from '../components/header'
import Share from '../components/share'

import blogStyles from '../styles/blog.module.css'
import sharedStyles from '../styles/shared.module.css'

import { getBlogLink, getTagLink } from '../lib/blog-helpers'
import { textBlock } from '../lib/notion/renderers'
import getNotionUsers from '../lib/notion/getNotionUsers'
import getBlogIndex from '../lib/notion/getBlogIndex'
import { getPosts, getAllTags } from '../lib/notion/client'

export async function getStaticProps() {
  const posts = await getPosts()
  const tags = await getAllTags()

  return {
    props: {
      posts,
      tags,
    },
    // unstable_revalidate: 60,
  }
}

const Index = ({ posts = [], tags = [] }) => {
  return (
    <>
      <Header titlePre="Blog" />
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
                  <Link href="/blog/[slug]" as={getBlogLink(post.Slug)}>
                    <a>{post.Title}</a>
                  </Link>
                </span>
              </h3>
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
                <div className={blogStyles.subText}>{post.Date}</div>
              )}
              <p>{post.Excerpt}</p>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default Index
