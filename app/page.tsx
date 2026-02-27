// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">五险一金计算器</h1>
        <p className="text-gray-500">快速计算员工社保公积金公司应缴费用</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* 卡片一：数据上传 */}
        <Link href="/upload" className="block group">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-full transition-all duration-300 hover:shadow-md hover:border-blue-500 hover:-translate-y-1">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-colors">
              <svg className="w-8 h-8 text-blue-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">数据上传与计算</h2>
            <p className="text-gray-500 line-clamp-2">上传城市社保标准与员工工资明细，选择计算城市并一键生成缴纳明细。</p>
          </div>
        </Link>

        {/* 卡片二：结果查询 */}
        <Link href="/results" className="block group">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-full transition-all duration-300 hover:shadow-md hover:green-500 hover:-translate-y-1">
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors">
              <svg className="w-8 h-8 text-green-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">结果查询</h2>
            <p className="text-gray-500 line-clamp-2">查看已计算完成的员工五险一金公司应缴费用明细报表。</p>
          </div>
        </Link>
      </div>
    </main>
  );
}