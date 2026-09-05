export default function Loading() {
  return <main className="shell min-h-screen py-24"><div className="skeleton h-5 w-40 rounded-full" /><div className="skeleton mt-6 h-20 max-w-2xl rounded-2xl" /><div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="skeleton aspect-[4/5] rounded-[26px]" />)}</div></main>;
}
