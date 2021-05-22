import Link from 'next/link'
import Head from 'next/head'
import ExtLink from './ext-link'
import { useRouter } from 'next/router'
import styles from '../styles/header.module.css'

const navItems: { label: string; page?: string; link?: string }[] = [
  { label: 'blog', page: '/' },
  { label: 'sister', link: 'https://sisterwith.com' },
]

const defaultOgImageUrl =
  'https://sister-prod.s3-ap-northeast-1.amazonaws.com/big-sister-card.png'
const defaultUrl = 'https://blog.sisterwith.com'
const defaultTitle = 'sister（シスター）'
const defaultDescription =
  'sister（シスター）｜IT・Web業界に特化した女性向けサービス'

const Header = ({ path = '', titlePre = '' }) => {
  const { pathname } = useRouter()

  return (
    <header className={styles.header}>
      <Head>
        <title>{titlePre ? `${titlePre} |` : ''} sister blog</title>
        <meta name="description" content={defaultDescription} />
        <meta property="og:url" content={`${defaultUrl}${path}`} />
        <meta name="og:title" content={!titlePre ? defaultTitle : titlePre} />
        <meta property="og:image" content={defaultOgImageUrl} />
        <meta name="twitter:site" content="@sister_jp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={defaultOgImageUrl} />
      </Head>
      <ul>
        {navItems.map(({ label, page, link }) => (
          <li key={label}>
            {page ? (
              <Link href={page}>
                <a className={pathname === page ? 'active' : undefined}>
                  {label}
                </a>
              </Link>
            ) : (
              <ExtLink href={link}>{label}</ExtLink>
            )}
          </li>
        ))}
      </ul>
    </header>
  )
}

export default Header
