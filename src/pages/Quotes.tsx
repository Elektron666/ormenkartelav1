import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw, Heart, Star, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { DateTimeDisplay } from '../components/DateTimeDisplay';

interface QuoteData {
  text: string;
  author: string;
  category: 'seneca' | 'marcus';
}

const quotes: QuoteData[] = [
  // Lucius Annaeus Seneca Quotes
  {
    text: "Her yeni başlangıç, bir önceki sondan doğar.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Zaman bizim en değerli varlığımızdır, onu akıllıca kullanmalıyız.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Büyük işler cesaret, güç ve kararlılık gerektirir.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Mutluluk erdemde bulunur, zenginlikte değil.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Öfke, geçici bir delilik halidir.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Hayat uzun değildir, ama biz onu uzun kılabiliriz.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Bilgelik, tecrübenin kızıdır.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Şans, hazırlığın fırsatla buluşmasıdır.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Kendini tanımak, tüm bilgilerin başlangıcıdır.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Sabır, tüm acıların ilacıdır.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },

  // Marcus Aurelius Quotes
  {
    text: "Bugünü yaşa. Dünü unut, yarını merak etme.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Düşünceleriniz gerçekliğinizi şekillendirir.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Değiştiremediğin şeyleri kabul et, değiştirebileceklerini değiştir.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "En iyi intikam, düşmanın gibi olmamaktır.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Güçlü olan, kendini kontrol edebilen kişidir.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Her sabah yeniden doğarız. Bugün ne yapacağımız en önemli şeydir.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Zihnin huzuru, düzenli düşüncenin ürünüdür.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Başkalarını değiştirmeye çalışmak yerine, kendini değiştir.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Hayatın kalitesi, düşüncelerinizin kalitesine bağlıdır.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Zorluklarla karşılaştığında, bunların seni güçlendirdiğini hatırla.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  
  // Additional Seneca Quotes
  {
    text: "Cesaret, korkunun üstesinden gelmektir, onu yok etmek değil.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Gerçek zenginlik, az şeye ihtiyaç duymaktır.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Hayatta en önemli şey, nasıl yaşayacağını öğrenmektir.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Akıl, ruhun gözüdür.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "İyi bir vicdan, en güvenli yastıktır.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Zaman geçer, ama bilgelik kalır.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Başarı, hazırlık ve fırsatın buluşmasıdır.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Kendine hakim olan, dünyaya hakim olur.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Erdem, kendi ödülüdür.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Büyük ruhlar, büyük zorluklarla test edilir.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Hayat kısa değildir, biz onu kısa yaparız.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  {
    text: "Öğrenmeyi bıraktığın gün, yaşamayı da bırakırsın.",
    author: "Lucius Annaeus Seneca",
    category: "seneca"
  },
  
  // Additional Marcus Aurelius Quotes
  {
    text: "Geçmişe takılma, geleceği merak etme, şimdiye odaklan.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Mutluluk, kendi ellerindedir.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Karakterin, davranışlarının toplamıdır.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Sabır ve zaman, en güçlü ordulardır.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "İç huzur, dış koşullardan bağımsızdır.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Kendini geliştirmek, en büyük yatırımdır.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Doğru düşünce, doğru eylemin temelidir.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Güçlü karakter, zorluklarla şekillenir.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Bilgelik, tecrübenin en değerli meyvesidir.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Her gün yeni bir fırsattır, onu değerlendir.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Kendine saygı, başkalarından saygı görmenin temelidir.",
    author: "Marcus Aurelius",
    category: "marcus"
  },
  {
    text: "Zihinsel disiplin, en büyük güçtür.",
    author: "Marcus Aurelius",
    category: "marcus"
  }
];

export const Quotes: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState<QuoteData>(quotes[0]);
  const [filter, setFilter] = useState<'all' | 'seneca' | 'marcus'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const filteredQuotes = quotes.filter(quote => 
    filter === 'all' || quote.category === filter
  );

  const getRandomQuote = () => {
    setIsAnimating(true);
    setTimeout(() => {
      const availableQuotes = filteredQuotes.filter(q => q.text !== currentQuote.text);
      const randomIndex = Math.floor(Math.random() * availableQuotes.length);
      setCurrentQuote(availableQuotes[randomIndex] || filteredQuotes[0]);
      setIsAnimating(false);
    }, 300);
  };

  const toggleFavorite = (quoteText: string) => {
    setFavorites(prev => 
      prev.includes(quoteText) 
        ? prev.filter(fav => fav !== quoteText)
        : [...prev, quoteText]
    );
  };

  useEffect(() => {
    // Auto-change quote every 30 seconds
    const interval = setInterval(() => {
      getRandomQuote();
    }, 30000);

    return () => clearInterval(interval);
  }, [filteredQuotes, currentQuote]);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('ormen_favorite_quotes');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    // Save favorites to localStorage
    localStorage.setItem('ormen_favorite_quotes', JSON.stringify(favorites));
  }, [favorites]);

  const getAuthorColor = (category: string) => {
    return category === 'seneca' ? 'text-purple-600' : 'text-blue-600';
  };

  const getAuthorBg = (category: string) => {
    return category === 'seneca' ? 'bg-purple-100' : 'bg-blue-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-ormen-100 rounded-full flex items-center justify-center mr-4">
              <BookOpen className="w-6 h-6 text-ormen-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Motivasyon Köşesi</h1>
              <p className="text-gray-600">Antik bilgelik, modern motivasyon</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center mb-6">
          <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
            <DateTimeDisplay />
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center space-x-4">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          Tümü
        </Button>
        <Button
          variant={filter === 'seneca' ? 'primary' : 'outline'}
          onClick={() => setFilter('seneca')}
          size="sm"
          className={filter === 'seneca' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-600 text-purple-600 hover:bg-purple-50'}
        >
          Seneca
        </Button>
        <Button
          variant={filter === 'marcus' ? 'primary' : 'outline'}
          onClick={() => setFilter('marcus')}
          size="sm"
          className={filter === 'marcus' ? 'bg-blue-600 hover:bg-blue-700' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}
        >
          Marcus Aurelius
        </Button>
      </div>

      {/* Main Quote Display */}
      <div className="max-w-4xl mx-auto">
        <div className={`bg-gradient-to-br ${
          currentQuote.category === 'seneca' 
            ? 'from-purple-50 to-purple-100 border-purple-200' 
            : 'from-blue-50 to-blue-100 border-blue-200'
        } rounded-2xl p-8 shadow-lg border-2 transition-all duration-500 ${
          isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}>
          
          {/* Quote Icon */}
          <div className="flex justify-center mb-6">
            <div className={`w-16 h-16 ${getAuthorBg(currentQuote.category)} rounded-full flex items-center justify-center`}>
              <Quote className={`w-8 h-8 ${getAuthorColor(currentQuote.category)}`} />
            </div>
          </div>

          {/* Quote Text */}
          <blockquote className="text-center">
            <p className="text-2xl md:text-3xl font-medium text-gray-800 leading-relaxed mb-6 italic">
              "{currentQuote.text}"
            </p>
            <footer className="flex items-center justify-center space-x-4">
              <cite className={`text-lg font-semibold ${getAuthorColor(currentQuote.category)}`}>
                — {currentQuote.author}
              </cite>
              <button
                onClick={() => toggleFavorite(currentQuote.text)}
                className={`p-2 rounded-full transition-colors ${
                  favorites.includes(currentQuote.text)
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorites.includes(currentQuote.text) ? 'fill-current' : ''}`} />
              </button>
            </footer>
          </blockquote>

          {/* Action Button */}
          <div className="flex justify-center mt-8">
            <Button
              variant="primary"
              icon={RefreshCw}
              onClick={getRandomQuote}
              className={`${
                currentQuote.category === 'seneca' 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Yeni Söz
            </Button>
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            Favori Sözlerim ({favorites.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quotes
              .filter(quote => favorites.includes(quote.text))
              .map((quote, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    quote.category === 'seneca'
                      ? 'bg-purple-50 border-purple-400'
                      : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <p className="text-gray-800 italic mb-2">"{quote.text}"</p>
                  <div className="flex items-center justify-between">
                    <cite className={`text-sm font-medium ${getAuthorColor(quote.category)}`}>
                      — {quote.author}
                    </cite>
                    <button
                      onClick={() => toggleFavorite(quote.text)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Quote className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{quotes.filter(q => q.category === 'seneca').length}</p>
            <p className="text-sm text-gray-600">Seneca Sözleri</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Quote className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{quotes.filter(q => q.category === 'marcus').length}</p>
            <p className="text-sm text-gray-600">Marcus Aurelius Sözleri</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
            <p className="text-sm text-gray-600">Favori Sözlerim</p>
          </div>
        </div>
      </div>
    </div>
  );
};