const REPO_URL = 'https://github.com/corestate55/ownhypecycle'

export function GitHubRibbon() {
  return (
    <a
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed top-0 right-0 z-50 block h-32 w-32 overflow-hidden"
      aria-label="Fork me on GitHub"
    >
      <div className="absolute top-9 right-[-42px] w-[192px] rotate-45 bg-gray-800 py-1.5 text-center text-xs font-semibold tracking-wide text-white shadow-md">
        Fork me on GitHub
      </div>
    </a>
  )
}
