import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '../../../components/header'

import blogStyles from '../../../styles/blog.module.css'
import sharedStyles from '../../../styles/shared.module.css'

import { getBlogLink, getTagLink } from '../../../lib/blog-helpers'
import { textBlock } from '../../../lib/notion/renderers'
import { useEffect } from 'react'
import getNotionUsers from '../../../lib/notion/getNotionUsers'
import getBlogIndex from '../../../lib/notion/getBlogIndex'
import { getPostsByTag, getAllTags } from '../../../lib/notion/client'

export async function getStaticProps({ params: { tag } }) {
  const posts = await getPostsByTag(tag)
  const tags = await getAllTags()

  if (posts.length === 0) {
    console.log(`Failed to find posts for tag: ${tag}`)
    return {
      props: {
        redirect: '/blog',
        preview: false,
      },
      unstable_revalidate: 30,
    }
  }

  return {
    props: {
      posts,
      tag,
    },
    revalidate: 10,
  }
}

// Return our list of tags to prerender
export async function getStaticPaths() {
  const tags = await getAllTags()

  return {
    paths: tags.map((tag) => getTagLink(tag)),
    fallback: true,
  }
}

export default ({ tag, posts = [], tags = [], redirect }) => {
  const router = useRouter()

  useEffect(() => {
    if (redirect && posts.length === 0) {
      router.replace(redirect)
    }
  }, [redirect, posts])

  // If the page is not yet generated, this will be displayed
  // initially until getStaticProps() finishes running
  if (router.isFallback) {
    return <div>Loading...</div>
  }

  // if you don't have any posts at this point, and are not
  // loading one from fallback then  redirect back to the index
  if (posts.length === 0) {
    return (
      <div className={blogStyles.post}>
        <p>
          Woops! didn't find any posts, redirecting you back to the blog index
        </p>
      </div>
    )
  }

  return (
    <>
      <Header titlePre={`${tag}を含む記事`} />
      <div className={`${sharedStyles.layout} ${blogStyles.blogIndex}`}>
        <h2>{tag}</h2>
        {posts.length === 0 && (
          <p className={blogStyles.noPosts}>There are no posts yet</p>
        )}
        {posts.map((post) => {
          return (
            <div className={blogStyles.postPreview} key={post.Slug}>
              <h3>
                <div className={blogStyles.titleContainer}>
                  <Link
                    href="/blog/[slug]"
                    as={getBlogLink(post.Slug)}
                    passHref
                  >
                    <a>{post.Title}</a>
                  </Link>
                </div>
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
              <p>
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
