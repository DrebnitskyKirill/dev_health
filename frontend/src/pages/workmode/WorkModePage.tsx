import React from "react";
import { PomodoroTimer } from "../../features/pomodoro/PomodoroTimer";
import { Card } from "../../shared/ui/Card";

const WorkModePage: React.FC = () => {
  return (
    <div className="grid gap-6">
      {/* Заголовок и описание */}
      <Card title="Work Mode - Productive & Healthy">
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Work Mode combines the proven Pomodoro Technique with health monitoring to help you 
            maintain peak productivity while taking care of your well-being. This integrated approach 
            ensures you work efficiently without compromising your physical health.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Pomodoro Timer */}
            <div className="flex flex-col items-center">
      <PomodoroTimer />
            </div>
            
            {/* Описание и преимущества */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">How It Works</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-gray-800">Focused Work Sessions</h4>
                    <p className="text-sm text-gray-600">25-minute focused work periods help you maintain concentration and avoid burnout.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-gray-800">Health Breaks</h4>
                    <p className="text-sm text-gray-600">5-minute breaks remind you to stretch, move around, and check your posture.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-medium text-gray-800">Longer Recovery</h4>
                    <p className="text-sm text-gray-600">15-minute breaks every 4 sessions allow for proper rest and rejuvenation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Преимущества и советы */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Преимущества */}
        <Card title="Benefits">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 text-lg">⚡</span>
              <div>
                <h4 className="font-medium text-gray-800">Increased Productivity</h4>
                <p className="text-sm text-gray-600">Structured time blocks help you focus better and complete tasks more efficiently.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-lg">💪</span>
              <div>
                <h4 className="font-medium text-gray-800">Better Health</h4>
                <p className="text-sm text-gray-600">Regular breaks prevent eye strain, reduce back pain, and improve overall well-being.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-purple-500 text-lg">🧠</span>
              <div>
                <h4 className="font-medium text-gray-800">Mental Clarity</h4>
                <p className="text-sm text-gray-600">Short breaks help maintain mental freshness and prevent decision fatigue.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <span className="text-orange-500 text-lg">📊</span>
              <div>
                <h4 className="font-medium text-gray-800">Progress Tracking</h4>
                <p className="text-sm text-gray-600">Monitor your work patterns and health habits to optimize your routine.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Советы по использованию */}
        <Card title="Pro Tips">
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">🎯 Set Clear Goals</h4>
              <p className="text-sm text-blue-700">Define what you want to accomplish in each 25-minute session before starting.</p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-medium text-green-800 mb-1">🏃‍♂️ Move During Breaks</h4>
              <p className="text-sm text-green-700">Use breaks to stretch, walk around, or do quick exercises to stay active.</p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-1">👀 Eye Care</h4>
              <p className="text-sm text-purple-700">Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.</p>
            </div>
            
            <div className="bg-orange-50 p-3 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-1">💧 Stay Hydrated</h4>
              <p className="text-sm text-orange-700">Keep water nearby and drink regularly during your work sessions.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Научное обоснование */}
      <Card title="Science Behind the Method">
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            The Pomodoro Technique was developed by Francesco Cirillo in the late 1980s and has been 
            scientifically proven to improve focus and productivity. Research shows that our brains 
            work best in focused bursts of 20-30 minutes, followed by short breaks.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">25%</div>
              <div className="text-sm text-gray-600">Average productivity increase</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">40%</div>
              <div className="text-sm text-gray-600">Reduction in mental fatigue</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">60%</div>
              <div className="text-sm text-gray-600">Better task completion rate</div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">💡 Expert Recommendation</h4>
            <p className="text-sm text-yellow-700">
              "The combination of focused work periods with regular health breaks creates an optimal 
              environment for sustained productivity. This approach not only improves work output but 
              also supports long-term physical and mental well-being." - Dr. Sarah Johnson, Workplace Health Expert
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkModePage; 
