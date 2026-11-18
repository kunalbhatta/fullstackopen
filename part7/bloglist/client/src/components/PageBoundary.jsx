import { Component } from 'react'

export default class PageBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return <p role="alert">Something went wrong while opening the page.</p>
    }
    return this.props.children
  }
}
