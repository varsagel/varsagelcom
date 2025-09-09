'use client'

export default function TestPage() {
  return (
    <div className="bg-red-500 text-white p-8 text-center">
      <h1 className="text-4xl font-bold">Tailwind CSS Test</h1>
      <p className="mt-4">Bu kırmızı arka plan görünüyorsa Tailwind çalışıyor</p>
      <div className="bg-blue-500 p-4 mt-4 rounded-lg">
        <p>Bu mavi kutu da görünmeli</p>
      </div>
    </div>
  )
}