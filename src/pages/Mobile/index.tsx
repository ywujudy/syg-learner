import logo from '@/assets/syg-logo.jpg'

const MobilePage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white px-6 text-center">
      <img src={logo} alt="思研阁 Logo" className="mb-6 h-24 w-24 rounded-2xl shadow-lg" />
      <h1 className="mb-2 text-3xl font-bold text-blue-600">思研阁</h1>
      <p className="mb-6 text-sm tracking-widest text-gray-500">SI YAN GE · 专注数理化提分辅导</p>
      <div className="max-w-sm rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">请在电脑或平板访问</h2>
        <p className="text-sm leading-relaxed text-gray-600">
          本平台需要键盘进行打字练习，
          <br />
          建议在 PC 或外接键盘的平板上使用。
        </p>
      </div>
    </div>
  )
}

export default MobilePage
