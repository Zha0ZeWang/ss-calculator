// app/upload/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { supabase } from "../../lib/supabase";

export default function UploadPage() {
  const[cityFile, setCityFile] = useState<File | null>(null);
  const[salaryFile, setSalaryFile] = useState<File | null>(null);

  const [isUploadingCity, setIsUploadingCity] = useState(false);
  const [isUploadingSalary, setIsUploadingSalary] = useState(false);
  
  // 新增状态：存储从数据库拉取的城市列表、当前选中的城市ID、计算Loading状态
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const[selectedCityId, setSelectedCityId] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState(false);

  // 页面加载时，以及每次城市数据上传成功后，拉取最新的城市列表
  const fetchCities = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("cities").select("*");
    if (data) setCitiesList(data);
    if (error) console.error("获取城市列表失败:", error);
  };

  useEffect(() => {
    if (!supabase) {
      alert("请配置 Supabase 环境变量后再使用");
      return;
    }
    fetchCities();
  },[]);

  const readExcel = (file: File) => {
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleCityUpload = async () => {
    if (!supabase) return alert("请配置 Supabase 环境变量后再使用");
    if (!cityFile) return alert("请先选择城市标准 Excel 文件！");
    setIsUploadingCity(true);
    try {
      const data = await readExcel(cityFile);
      const { error: deleteError } = await supabase.from("cities").delete().gt("id", 0);
      if (deleteError) throw deleteError;
      const { error: insertError } = await supabase.from("cities").insert(data);
      if (insertError) throw insertError;

      alert("🎉 城市标准数据上传成功！");
      setCityFile(null);
      fetchCities(); // 上传成功后刷新下拉列表
    } catch (error: any) {
      alert("上传失败: " + (error.message || "未知错误"));
    } finally {
      setIsUploadingCity(false);
    }
  };

  const handleSalaryUpload = async () => {
    if (!supabase) return alert("请配置 Supabase 环境变量后再使用");
    if (!salaryFile) return alert("请先选择员工工资 Excel 文件！");
    setIsUploadingSalary(true);
    try {
      const data = await readExcel(salaryFile);
      const { error: deleteError } = await supabase.from("salaries").delete().gt("id", 0);
      if (deleteError) throw deleteError;
      const { error: insertError } = await supabase.from("salaries").insert(data);
      if (insertError) throw insertError;

      alert("🎉 员工工资数据上传成功！");
      setSalaryFile(null);
    } catch (error: any) {
      alert("上传失败: " + (error.message || "未知错误"));
    } finally {
      setIsUploadingSalary(false);
    }
  };

  // 核心业务逻辑：执行计算
  const handleCalculate = async () => {
    if (!supabase) return alert("请配置 Supabase 环境变量后再使用");
    if (!selectedCityId) return alert("请先在下拉框中选择计算城市！");
    setIsCalculating(true);

    try {
      // 1. 获取选中的城市标准数据
      const city = citiesList.find((c) => c.id.toString() === selectedCityId);
      if (!city) throw new Error("城市数据异常，请刷新页面重试");

      // 2. 从数据库拉取全部员工工资明细
      const { data: salaries, error: salaryError } = await supabase.from("salaries").select("*");
      if (salaryError) throw salaryError;
      if (!salaries || salaries.length === 0) throw new Error("未找到员工工资数据，请先上传工资Excel！");

      // 3. 按员工姓名分组计算总工资
      const employeeTotals: Record<string, number> = {};
      salaries.forEach((s) => {
        if (!employeeTotals[s.employee_name]) {
          employeeTotals[s.employee_name] = 0;
        }
        employeeTotals[s.employee_name] += Number(s.salary_amount);
      });

      // 4. 执行核心算法
      const resultsData = Object.keys(employeeTotals).map((name) => {
        const totalSalary = employeeTotals[name];
        // 算出年度月均工资 (总薪资 ÷ 12)
        const avg_salary = totalSalary / 12; 
        
        // 确定缴费基数 (比对上下限)
        let contribution_base = avg_salary;
        if (avg_salary < city.base_min) contribution_base = city.base_min;
        if (avg_salary > city.base_max) contribution_base = city.base_max;

        // 计算公司缴纳金额
        const company_fee = contribution_base * city.rate;

        // 返回保留两位小数的结果对象
        return {
          employee_name: name,
          avg_salary: Number(avg_salary.toFixed(2)),
          contribution_base: Number(contribution_base.toFixed(2)),
          company_fee: Number(company_fee.toFixed(2)),
        };
      });

      // 5. 先清空旧的结果数据
      const { error: delError } = await supabase.from("results").delete().gt("id", 0);
      if (delError) throw delError;

      // 6. 批量插入最新计算结果
      const { error: insError } = await supabase.from("results").insert(resultsData);
      if (insError) throw insError;

      alert("✅ 计算成功！结果已持久化保存。请点击上方【返回主页】进入【结果查询】页面查看明细。");
      
    } catch (error: any) {
      console.error(error);
      alert("计算过程出错: " + (error.message || "未知错误"));
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">数据上传与操作面板</h1>
          <Link href="/" className="text-blue-600 hover:underline">返回主页</Link>
        </div>

        {/* 区域一：城市标准上传 */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">1. 导入城市标准 (Excel)</h2>
          <p className="text-sm text-gray-500 mb-4">
            表头需严格包含：<code className="bg-gray-100 px-1 rounded">city_name</code>, <code className="bg-gray-100 px-1 rounded">year</code>, <code className="bg-gray-100 px-1 rounded">base_min</code>, <code className="bg-gray-100 px-1 rounded">base_max</code>, <code className="bg-gray-100 px-1 rounded">rate</code>
          </p>
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              accept=".xlsx, .xls"
              onChange={(e) => setCityFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" 
            />
            <button 
              onClick={handleCityUpload}
              disabled={isUploadingCity}
              className={`px-6 py-2 text-white rounded-md transition-colors whitespace-nowrap ${isUploadingCity ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isUploadingCity ? "上传中..." : "上传城市数据"}
            </button>
          </div>
        </section>

        {/* 区域二：员工工资上传 */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">2. 导入员工工资 (Excel)</h2>
          <p className="text-sm text-gray-500 mb-4">
            表头需严格包含：<code className="bg-gray-100 px-1 rounded">employee_id</code>, <code className="bg-gray-100 px-1 rounded">employee_name</code>, <code className="bg-gray-100 px-1 rounded">month</code>, <code className="bg-gray-100 px-1 rounded">salary_amount</code>
          </p>
          <div className="flex items-center gap-4">
            <input 
              type="file" 
              accept=".xlsx, .xls"
              onChange={(e) => setSalaryFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer" 
            />
            <button 
              onClick={handleSalaryUpload}
              disabled={isUploadingSalary}
              className={`px-6 py-2 text-white rounded-md transition-colors whitespace-nowrap ${isUploadingSalary ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isUploadingSalary ? "上传中..." : "上传工资数据"}
            </button>
          </div>
        </section>

        {/* 区域三：执行计算 (已激活) */}
        <section className="bg-white p-6 rounded-xl shadow-sm border border-green-200 ring-1 ring-green-50">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            3. 执行计算 <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-normal">核心功能</span>
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <select 
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="block w-full sm:w-64 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm text-gray-700"
            >
              <option value="">-- 请选择计算城市 --</option>
              {citiesList.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.city_name} {city.year ? `(${city.year})` : ''} - 比例:{city.rate}
                </option>
              ))}
            </select>
            <button 
              onClick={handleCalculate}
              disabled={isCalculating || citiesList.length === 0}
              className={`px-6 py-2 text-white rounded-md transition-all whitespace-nowrap font-medium shadow-sm ${
                isCalculating 
                  ? 'bg-green-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-md active:transform active:scale-95'
              }`}
            >
              {isCalculating ? "正在拼命计算中..." : "🚀 执行计算并存储结果"}
            </button>
          </div>
        </section>

      </div>
    </main>
  );
}