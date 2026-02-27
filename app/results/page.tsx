// app/results/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

// 定义结果数据的类型接口
interface ResultItem {
  id: number;
  employee_name: string;
  avg_salary: number;
  contribution_base: number;
  company_fee: number;
}

export default function ResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 页面加载时获取结果数据
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data, error } = await supabase
          .from("results")
          .select("*")
          .order("id", { ascending: true }); // 按ID排序

        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error("获取结果失败:", error);
        alert("获取数据失败，请检查控制台日志");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 顶部导航 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">计算结果展示</h1>
            <p className="text-gray-500 mt-1">五险一金公司应缴费用明细表</p>
          </div>
          <div className="flex items-center space-x-4 bg-white px-4 py-2 rounded-lg shadow-sm">
            <Link href="/upload" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
              ← 重新上传/计算
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              返回主页
            </Link>
          </div>
        </div>

        {/* 数据表格区 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
              <p>正在加载数据...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-xl mb-2">📭 暂无计算结果</p>
              <p>请先前往 <Link href="/upload" className="text-blue-600 underline">上传页面</Link> 进行计算。</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      员工姓名
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                      年度月平均工资
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-blue-600 uppercase tracking-wider">
                      最终缴费基数
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-green-600 uppercase tracking-wider bg-green-50">
                      公司应缴纳金额
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.employee_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right font-mono">
                        ¥ {item.avg_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono font-semibold">
                        ¥ {item.contribution_base.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-right font-mono bg-green-50/50 group-hover:bg-green-100/50 transition-colors">
                        ¥ {item.company_fee.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="text-center text-gray-400 text-sm mt-8">
          End of Report
        </div>

      </div>
    </main>
  );
}