import Link from 'next/link'


const ResumeRoaster = () => {
  return (
    <div className="w-full max-w-2xl pt-6 py-2">
        <Link 
          href="/roast" 
          className='px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#FFDA37]/85 to-[#F3A10B] text-black font-medium text-sm w-fit cursor-pointer'
        >
          Roast Your Resume
        </Link>
    </div>
  )
}

export default ResumeRoaster