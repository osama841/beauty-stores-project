<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http; // لاستخدام Guzzle HTTP Client

class BeautyAdvisorController extends Controller
{
    /**
     * Ask the AI Beauty Advisor a question using the Gemini API.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function ask(Request $request)
    {
        // التحقق من صحة الطلب: يجب أن يحتوي على حقل 'question'
        $request->validate([
            'question' => 'required|string|min:3|max:500',
        ]);

        $userQuestion = $request->input('question');

        try {
            // بناء حمولة الطلب لـ Gemini API
            $payload = [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => "As a beauty advisor for a beauty store, answer the following question. Be helpful, concise, and professional. Avoid giving medical advice. If the question is not related to beauty, politely decline. Question: " . $userQuestion],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.7, // التحكم في عشوائية الاستجابة
                    'maxOutputTokens' => 200, // الحد الأقصى لعدد التوكنات في الاستجابة
                ],
            ];

            // استدعاء Gemini API
            // ملاحظة: Canvas يوفر مفتاح API تلقائيًا إذا كان فارغًا.
            $apiKey = env('GEMINI_API_KEY', ''); // يمكنك تعيين مفتاح API في ملف .env إذا أردت استخدام نموذج مختلف
            $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$apiKey}";

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($apiUrl, $payload);

            // التحقق من نجاح الاستجابة
            if ($response->successful()) {
                $geminiResponse = $response->json();

                // استخراج النص من استجابة Gemini
                $text = $geminiResponse['candidates'][0]['content']['parts'][0]['text'] ?? 'Sorry, I could not process your request.';

                return response()->json(['answer' => $text]);
            } else {
                // التعامل مع الأخطاء من Gemini API
                return response()->json([
                    'message' => 'Failed to get response from AI advisor.',
                    'details' => $response->json(),
                ], $response->status());
            }

        } catch (\Exception $e) {
            // التعامل مع الأخطاء العامة
            return response()->json([
                'message' => 'An error occurred while contacting the AI advisor.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
