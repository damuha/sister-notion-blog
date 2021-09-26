import React from 'react'
import {
  FacebookIcon,
  FacebookShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share'
import blogStyles from '../styles/blog.module.css'

type Props = {
  text: string
  url: string
}

const Share = ({ text, url }: Props) => {
  return (
    <div>
      <TwitterShareButton url={url} title={text}>
        <TwitterIcon size={32} round={true} />
      </TwitterShareButton>
      <FacebookShareButton url={url}>
        <FacebookIcon size={32} round={true} />
      </FacebookShareButton>
    </div>
  )
}

export default Share
