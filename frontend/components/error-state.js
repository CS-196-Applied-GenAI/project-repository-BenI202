export default function ErrorState({ title, message }) {
  return (
    <div className="rounded-[2rem] border border-[#f1b9a4] bg-[#fff1ea] p-5 text-[#7a2f14] shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6">{message}</p>
    </div>
  );
}
