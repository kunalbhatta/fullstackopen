import styled, { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  :root { color-scheme: light; font-family: Geist, system-ui, sans-serif; color: #222c29; background: #f5f7f3; }
  * { box-sizing: border-box; }
  body { margin: 0; }
  a { color: #235e4b; }
  h1, h2 { letter-spacing: -0.035em; margin-top: 0; }
  p { line-height: 1.5; }
  button {
    border: 1px solid #28604f;
    border-radius: 6px;
    background: #28604f;
    color: white;
    font: inherit;
    font-weight: 600;
    padding: .55rem .9rem;
    cursor: pointer;
  }
  button + button { margin-left: .6rem; }
  button:hover { background: #1d4e3f; }
  button:disabled { opacity: .65; cursor: wait; }
  a:focus-visible, button:focus-visible, input:focus-visible { outline: 3px solid #f4ad55; outline-offset: 2px; }
`

export const Navigation = styled.nav`
  min-height: 60px;
  padding: .6rem max(1.2rem, calc((100% - 66rem) / 2));
  background: #193d33;
  color: #fff;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  a { color: #fff; text-decoration-thickness: 1px; text-underline-offset: 4px; }
  a[aria-current] { font-weight: 750; }
  span { margin-left: auto; }
  button { background: transparent; border-color: #b6cec4; }
`

export const Main = styled.main`
  margin: 0 auto;
  max-width: 66rem;
  padding: clamp(1.2rem, 4vw, 2.5rem) 1.2rem;
`

export const Panel = styled.section`
  background: #fff;
  border: 1px solid #d4e2d9;
  border-radius: 12px;
  max-width: 38rem;
  padding: clamp(1rem, 4vw, 2rem);
  overflow-wrap: anywhere;
`

export const Form = styled.form`
  display: grid;
  gap: 1rem;
  label { display: grid; gap: .4rem; font-weight: 650; }
  input {
    width: 100%;
    padding: .7rem .75rem;
    border: 1px solid #aabdb3;
    border-radius: 6px;
    font: inherit;
  }
  button { justify-self: start; }
`

export const Notice = styled.p`
  padding: .65rem 1rem;
  border: 1px solid ${props => props.$error ? '#ddada6' : '#add0bb'};
  background: ${props => props.$error ? '#fbefed' : '#e9f5ed'};
  border-radius: 6px;
`

export const BlogLinks = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: .7rem;
  li { background: white; border: 1px solid #d4e2d9; border-radius: 8px; padding: .85rem 1rem; }
  a { font-size: 1.1rem; font-weight: 680; overflow-wrap: anywhere; }
  span { display: block; margin-top: .35rem; }
`
