'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Send, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Question {
  id: string;
  content: string;
  askerName: string;
  askerImage?: string;
  createdAt: string;
  answer?: {
    content: string;
    createdAt: string;
  };
}

interface QuestionSectionProps {
  listingId: string;
  listingOwnerId: string;
}

export default function QuestionSection({ listingId, listingOwnerId }: QuestionSectionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // JWT token'dan kullanıcı ID'sini çıkar
  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
    fetchQuestions();
  }, [listingId]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error('Sorular yüklenirken hata:', error);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.trim()) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Soru sormak için giriş yapmanız gerekiyor.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/listings/${listingId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newQuestion.trim() })
      });

      if (response.ok) {
        setNewQuestion('');
        fetchQuestions();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Soru gönderilirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Soru gönderme hatası:', error);
      alert('Soru gönderilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerQuestion = async (questionId: string, answer: string) => {
    if (!answer.trim()) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/questions/${questionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: answer.trim() })
      });

      if (response.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error('Cevap gönderme hatası:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isOwner = currentUserId === listingOwnerId;

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse"></div>
          Sorular & Cevaplar
          <span className="text-sm font-normal text-slate-500 dark:text-slate-400">({questions.length} soru)</span>
        </h2>
        

      </div>

      {/* Soru Sorma Formu */}
      {!isOwner && currentUserId && (
        <form onSubmit={handleSubmitQuestion} className="mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
            <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-3">
              İlan sahibine soru sorun
            </label>
            <div className="flex gap-3">
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Projeyle ilgili merak ettiğiniz soruları buraya yazabilirsiniz..."
                className="flex-1 min-h-[100px] p-4 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!newQuestion.trim() || isLoading}
                className="self-end px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Giriş Yapma Uyarısı */}
      {!currentUserId && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 border border-amber-200/50 dark:border-amber-800/50">
          <p className="text-amber-700 dark:text-amber-300 text-center">
            Soru sormak için <a href="/auth/login" className="font-semibold underline hover:no-underline">giriş yapın</a>
          </p>
        </div>
      )}

      {/* Sorular Listesi */}
      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Henüz soru sorulmamış</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">İlk soruyu siz sorun!</p>
          </div>
        ) : (
          questions.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              isOwner={isOwner}
              onAnswer={(answer) => handleAnswerQuestion(question.id, answer)}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface QuestionItemProps {
  question: Question;
  isOwner: boolean;
  onAnswer: (answer: string) => void;
  formatDate: (date: string) => string;
}

function QuestionItem({ question, isOwner, onAnswer, formatDate }: QuestionItemProps) {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    setIsSubmitting(true);
    await onAnswer(answerText);
    setAnswerText('');
    setShowAnswerForm(false);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-900/10 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
      {/* Soru */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
          {question.askerImage ? (
            <img src={question.askerImage} alt={question.askerName} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="h-5 w-5 text-white" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{question.askerName}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(question.createdAt)}
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{question.content}</p>
        </div>
      </div>

      {/* Cevap */}
      {question.answer ? (
        <div className="ml-14 pl-6 border-l-2 border-green-200 dark:border-green-800">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-xl p-4 border border-green-200/50 dark:border-green-800/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-green-700 dark:text-green-300">İlan Sahibi</span>
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(question.answer.createdAt)}
              </span>
            </div>
            <p className="text-green-800 dark:text-green-200 leading-relaxed">{question.answer.content}</p>
          </div>
        </div>
      ) : (
        isOwner && (
          <div className="ml-14">
            {!showAnswerForm ? (
              <button
                onClick={() => setShowAnswerForm(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Cevapla
              </button>
            ) : (
              <form onSubmit={handleSubmitAnswer} className="mt-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Cevabınızı yazın..."
                    className="w-full min-h-[80px] p-3 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAnswerForm(false);
                        setAnswerText('');
                      }}
                      className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      disabled={isSubmitting}
                    >
                      İptal
                    </button>
                    <Button
                      type="submit"
                      disabled={!answerText.trim() || isSubmitting}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                      ) : (
                        'Gönder'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )
      )}
    </div>
  );
}