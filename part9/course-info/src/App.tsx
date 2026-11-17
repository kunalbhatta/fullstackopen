interface CoursePartBase { name: string; exerciseCount: number }
interface DescribedPart extends CoursePartBase { description: string }
interface BasicPart extends DescribedPart { kind: 'basic' }
interface GroupPart extends CoursePartBase { kind: 'group'; groupProjectCount: number }
interface BackgroundPart extends DescribedPart { kind: 'background'; backgroundMaterial: string }
interface SpecialPart extends DescribedPart { kind: 'special'; requirements: string[] }

type CoursePart = BasicPart | GroupPart | BackgroundPart | SpecialPart

const parts: CoursePart[] = [
  { name: 'Fundamentals', exerciseCount: 10, description: 'This is an awesome course part', kind: 'basic' },
  { name: 'Using props to pass data', exerciseCount: 7, groupProjectCount: 3, kind: 'group' },
  { name: 'Basics of type Narrowing', exerciseCount: 7, description: 'How to go from unknown to string', kind: 'basic' },
  { name: 'Deeper type usage', exerciseCount: 14, description: 'Confusing description', backgroundMaterial: 'https://type-level-typescript.com/template-literal-types', kind: 'background' },
  { name: 'TypeScript in frontend', exerciseCount: 10, description: 'A hard part', kind: 'basic' },
  { name: 'Backend development', exerciseCount: 21, description: 'Typing the backend', requirements: ['nodejs', 'jest'], kind: 'special' },
]

function assertNever(part: never): never {
  throw new Error(`Unexpected course part: ${JSON.stringify(part)}`)
}

function PartDetails({ part }: { part: CoursePart }) {
  switch (part.kind) {
    case 'basic':
      return <p>{part.description}</p>
    case 'group':
      return <p>{part.groupProjectCount} group projects</p>
    case 'background':
      return <><p>{part.description}</p><a href={part.backgroundMaterial}>Background material</a></>
    case 'special':
      return <><p>{part.description}</p><p>Requirements: {part.requirements.join(', ')}</p></>
    default:
      return assertNever(part)
  }
}

function Part({ part }: { part: CoursePart }) {
  return <article><h2>{part.name}</h2><p>{part.exerciseCount} exercises</p><PartDetails part={part} /></article>
}

function Header({ title }: { title: string }) { return <h1>{title}</h1> }
function Content({ parts }: { parts: CoursePart[] }) { return parts.map(part => <Part key={part.name} part={part} />) }
function Total({ parts }: { parts: CoursePart[] }) {
  return <p>Total exercises: {parts.reduce((total, part) => total + part.exerciseCount, 0)}</p>
}

export default function App() {
  return <main><Header title="Half Stack application development" /><Content parts={parts} /><Total parts={parts} /></main>
}
