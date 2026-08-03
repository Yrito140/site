import Image from 'next/image'

/** Логотип проекта: фирменная аватарка + слово «Marafon». */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 font-semibold ${className ?? ''}`}>
      {/* У картинки свой фон и скруглённые углы — плашка под ней не нужна. */}
      <Image
        src="/icon-192.png"
        alt="Marafon"
        width={192}
        height={192}
        priority
        className="size-8 shrink-0 rounded-xl object-cover"
      />
      Marafon
    </span>
  )
}
