import Link from 'next/link'


const ResumeRoaster = () => {
  return (
    <div className="pt-6 py-2">
        <Link 
          href="/roast" 
          className='px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#FFDA37]/85 to-[#F3A10B] hover:bg-[#ec860a] text-black font-medium text-sm cursor-pointer'
        >
          Roast Your Resume
        </Link>
    </div>
  )
}

export default ResumeRoaster