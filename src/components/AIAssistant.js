// This component has been removed as part of AI system removal
  const [activeTab, setActiveTab] = useState('insights');
  const [analysis, setAnalysis] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('Biology');
  const [generatingCards, setGeneratingCards] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState(null);
  const [loading, setLoading] = useState(false);

  // Generate analysis when data changes
  useEffect(() => {
    if (flashcards.length > 0 || studyLogs.length > 0) {
      setLoading(true);
      const analysisResult = analyzeStudyPatterns(studyLogs, flashcards);
      const scheduleResult = generateOptimalSchedule(flashcards, studyLogs);
      
      setAnalysis(analysisResult);
      setSchedule(scheduleResult);
      setLoading(false);
    }
  }, [flashcards, studyLogs]);

  const handleGenerateFlashcards = async () => {
    if (!textInput.trim()) return;

    setGeneratingCards(true);
    try {
      const generatedCards = await generateFlashcardsFromText(textInput, subjectInput, 5);
      
      // Analyze the quality of generated cards
      const realAICards = generatedCards.filter(card => card.realAI).length;
      const highConfidenceCards = generatedCards.filter(card => card.confidence > 0.8).length;
      const contextualCards = generatedCards.filter(card => 
        !card.back.includes('[Review your notes') && 
        !card.back.includes('provide a comprehensive explanation')
      ).length;
      
      // Add generated cards to the app
      for (const card of generatedCards) {
        await onAddFlashcard(card.front, card.back, card.subject);
      }
      
      setTextInput('');
      // Keep the subject selected for convenience
      
      // Show detailed success message with AI type
      let qualityMessage = '';
      if (realAICards > 0) {
        qualityMessage = `🤖 Generated ${realAICards} cards with real AI + ${generatedCards.length - realAICards} with enhanced rules`;
      } else {
        qualityMessage = `🔧 Generated ${generatedCards.length} cards with enhanced rule-based system`;
      }
      
      const additionalInfo = contextualCards === generatedCards.length 
        ? '\n✅ All cards have meaningful answers!'
        : `\n📊 ${contextualCards}/${generatedCards.length} cards with contextual answers`;
      
      alert(`${qualityMessage}${additionalInfo}\n⭐ ${highConfidenceCards} high-confidence cards created.`);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('Error generating flashcards. Please try again.');
    } finally {
      setGeneratingCards(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertCircle size={16} />;
      case 'medium': return <Info size={16} />;
      case 'low': return <CheckCircle size={16} />;
      default: return <Info size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-2">
          <Brain size={32} />
          <h2 className="text-2xl font-bold">AI Study Assistant</h2>
          <Sparkles size={24} className="text-yellow-300" />
        </div>
        <p className="text-purple-100">
          Powered by cognitive science research and machine learning to optimize your learning
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b">
          {[
            { id: 'insights', label: 'Smart Insights', icon: TrendingUp },
            { id: 'schedule', label: 'Optimal Schedule', icon: Calendar },
            { id: 'generator', label: 'Card Generator', icon: Sparkles },
            { id: 'techniques', label: 'Study Techniques', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Analyzing your study patterns...</span>
            </div>
          )}

          {/* Smart Insights Tab */}
          {activeTab === 'insights' && analysis && !loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="text-blue-600" size={20} />
                    <h3 className="font-semibold text-blue-800">Study Frequency</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {(analysis.studyFrequency.average * 7).toFixed(1)}
                  </p>
                  <p className="text-sm text-blue-600">sessions/week</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="text-green-600" size={20} />
                    <h3 className="font-semibold text-green-800">Optimal Time</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {analysis.optimalStudyTime.hour}:00
                  </p>
                  <p className="text-sm text-green-600">
                    {analysis.optimalStudyTime.confidence > 0.3 ? 'High confidence' : 'Low confidence'}
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="text-yellow-600" size={20} />
                    <h3 className="font-semibold text-yellow-800">Cognitive Load</h3>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 capitalize">
                    {analysis.cognitiveLoad.level}
                  </p>
                  <p className="text-sm text-yellow-600">
                    {(analysis.cognitiveLoad.score * 100).toFixed(0)}% intensity
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="text-purple-600" size={20} />
                    <h3 className="font-semibold text-purple-800">Consistency</h3>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {(analysis.studyFrequency.consistency * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-purple-600">study regularity</p>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Lightbulb className="mr-2 text-yellow-500" />
                  Personalized Recommendations
                </h3>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${getPriorityColor(rec.priority)}`}
                    >
                      <div className="flex items-start space-x-3">
                        {getPriorityIcon(rec.priority)}
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{rec.title}</h4>
                          <p className="text-sm mb-2">{rec.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium bg-white bg-opacity-50 px-2 py-1 rounded">
                              {rec.action}
                            </span>
                            <span className="text-xs opacity-75">
                              Based on: {rec.research}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Performance */}
              {Object.keys(analysis.subjectPerformance).length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Subject Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(analysis.subjectPerformance).map(([subject, stats]) => (
                      <div key={subject} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{subject}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Mastery Level:</span>
                            <span className="font-medium">
                              {(stats.masteryLevel * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${stats.masteryLevel * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>{stats.reviewed}/{stats.total} reviewed</span>
                            <span>Avg interval: {stats.averageInterval.toFixed(1)} days</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Optimal Schedule Tab */}
          {activeTab === 'schedule' && schedule && !loading && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Today's Recommended Session</h3>
                {schedule.daily.length > 0 ? (
                  <div className="space-y-3">
                    {schedule.daily.map((session, index) => (
                      <div key={index} className="bg-white rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Clock size={18} className="text-blue-600" />
                            <span className="font-medium">{session.time}</span>
                            <span className="text-sm text-gray-600">({session.duration} min)</span>
                          </div>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {session.cards.length} cards
                          </span>
                        </div>
                        
                        {session.cards.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Cards to Review:</h4>
                            <div className="space-y-1">
                              {session.cards.slice(0, 3).map((card, cardIndex) => (
                                <div key={cardIndex} className="text-sm text-gray-600 truncate">
                                  • {card.front}
                                </div>
                              ))}
                              {session.cards.length > 3 && (
                                <div className="text-sm text-gray-500">
                                  ... and {session.cards.length - 3} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Recommended Techniques:</h4>
                          <div className="flex flex-wrap gap-2">
                            {session.techniques.map((technique, techIndex) => (
                              <span
                                key={techIndex}
                                className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                              >
                                {technique.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-blue-600">No cards due for review today. Great job staying on top of your studies!</p>
                )}
              </div>

              {/* Weekly Plan */}
              {schedule.weekly.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Weekly Study Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {schedule.weekly.map((plan, index) => (
                      <div key={index} className="bg-white border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{plan.subject}</h4>
                          <span className="text-sm text-gray-500">
                            Day {plan.day + 1}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Focus:</span>
                            <span className="capitalize font-medium">{plan.focus.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Time:</span>
                            <span>{plan.estimatedTime} min</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Techniques: {plan.techniques.map(t => t.name).join(', ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card Generator Tab */}
          {activeTab === 'generator' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2 flex items-center">
                  <Sparkles className="mr-2 text-green-600" />
                  AI Flashcard Generator
                </h3>
                <p className="text-gray-600 mb-4">
                  Paste your study material and let AI extract key concepts and create flashcards automatically.
                  Uses advanced NLP to identify definitions, relationships, and important facts.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <select
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Biology">Biology</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="History">History</option>
                      <option value="Literature">Literature</option>
                      <option value="Psychology">Psychology</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Economics">Economics</option>
                      <option value="Geography">Geography</option>
                      <option value="Philosophy">Philosophy</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Study Material (paste text, notes, or articles)
                    </label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Paste your study material here... For example:

Photosynthesis is the process by which plants convert light energy into chemical energy. It occurs in the chloroplasts and involves two main stages: the light-dependent reactions and the Calvin cycle. The overall equation is 6CO2 + 6H2O + light energy → C6H12O6 + 6O2..."
                    />
                  </div>
                  
                  <button
                    onClick={handleGenerateFlashcards}
                    disabled={!textInput.trim() || generatingCards}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-md hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {generatingCards ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating Cards...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2" size={18} />
                        Generate Flashcards
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">How it works:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Identifies definitions and key concepts</li>
                  <li>• Extracts cause-and-effect relationships</li>
                  <li>• Finds important facts and figures</li>
                  <li>• Creates questions that test understanding</li>
                  <li>• Estimates difficulty and assigns confidence scores</li>
                </ul>
              </div>
            </div>
          )}

          {/* Study Techniques Tab */}
          {activeTab === 'techniques' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(aiAssistant.studyTechniques).map(([key, technique]) => (
                  <div
                    key={key}
                    className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTechnique(key)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{technique.name}</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full mr-1 ${
                                i < technique.effectiveness * 5
                                  ? 'bg-green-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{technique.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded ${
                        technique.cognitiveLoad === 'low' ? 'bg-green-100 text-green-800' :
                        technique.cognitiveLoad === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {technique.cognitiveLoad} load
                      </span>
                      <span className="text-gray-500">
                        {(technique.effectiveness * 100).toFixed(0)}% effective
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Technique Detail Modal */}
              {selectedTechnique && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-2xl mx-4 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">
                        {aiAssistant.studyTechniques[selectedTechnique].name}
                      </h3>
                      <button
                        onClick={() => setSelectedTechnique(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </div>
                    
                    {(() => {
                      const guide = getStudyTechniqueGuide(selectedTechnique);
                      return (
                        <div className="space-y-4">
                          <p className="text-gray-600">{guide.description}</p>
                          
                          <div>
                            <h4 className="font-semibold mb-2">How to implement:</h4>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                              {guide.implementation.map((step, index) => (
                                <li key={index}>{step}</li>
                              ))}
                            </ol>
                          </div>

                          {guide.examples && (
                            <div>
                              <h4 className="font-semibold mb-2">Example:</h4>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                {guide.examples}
                              </p>
                            </div>
                          )}

                          <div>
                            <h4 className="font-semibold mb-2">Common mistakes to avoid:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                              {guide.commonMistakes.map((mistake, index) => (
                                <li key={index}>{mistake}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-blue-50 p-3 rounded">
                            <p className="text-xs text-blue-600">
                              <strong>Research basis:</strong> {guide.research}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && (!analysis || (flashcards.length === 0 && studyLogs.length === 0)) && activeTab === 'insights' && (
            <div className="text-center py-12">
              <Brain className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Start studying to unlock AI insights</h3>
              <p className="text-gray-500">
                Create some flashcards and log study sessions to get personalized recommendations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;