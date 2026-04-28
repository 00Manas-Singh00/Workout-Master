import React, { useState, useEffect } from 'react';
import SectionWrapper from './SectionWrapper';
import Button from './ui/Button';
import Card from './ui/Card';
import { FaCalendarDay, FaDumbbell, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const WeeklyPlanView = ({ isDarkMode }) => {
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});

  useEffect(() => {
    const savedPlan = localStorage.getItem('aiWeeklyPlan');
    if (savedPlan) {
      try {
        setWeeklyPlan(JSON.parse(savedPlan));
      } catch (error) {
        console.error('Failed to parse weekly plan:', error);
      }
    }
  }, []);

  const toggleDay = (dayIndex) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };

  const handleStartDay = (dayPlan) => {
    // Store the day's workout and navigate to workout page
    localStorage.setItem('aiGeneratedWorkout', JSON.stringify({
      focus: dayPlan.focus,
      exercises: dayPlan.exercises
    }));
    window.location.href = '/workout';
  };

  if (!weeklyPlan) {
    return null;
  }

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <SectionWrapper isDarkMode={isDarkMode}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your AI Weekly Plan</h1>
          <Button
            onClick={() => {
              localStorage.removeItem('aiWeeklyPlan');
              setWeeklyPlan(null);
            }}
            variant="outline"
            size="md"
          >
            Clear Plan
          </Button>
        </div>

        <div className="space-y-4">
          {weeklyPlan.map((dayPlan, index) => {
            const isExpanded = expandedDays[index];
            const dayName = dayNames[index % 7] || `Day ${dayPlan.day}`;

            return (
              <Card key={index} className="overflow-hidden">
                <div
                  className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => toggleDay(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'
                    }`}>
                      <FaCalendarDay />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{dayName}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{dayPlan.focus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {dayPlan.exercises?.length || 0} exercises
                    </span>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <div className="space-y-3 mb-4">
                      {dayPlan.exercises?.map((exercise, exIndex) => (
                        <div
                          key={exIndex}
                          className={`p-3 rounded-lg ${
                            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {exercise.name}
                              </h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {exercise.muscles?.map((muscle, mIndex) => (
                                  <span
                                    key={mIndex}
                                    className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                                      isDarkMode
                                        ? 'bg-blue-900/30 text-blue-300 border border-blue-800'
                                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                                    }`}
                                  >
                                    {muscle}
                                  </span>
                                ))}
                                {exercise.type && (
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                                      isDarkMode
                                        ? 'bg-purple-900/30 text-purple-300 border border-purple-800'
                                        : 'bg-purple-50 text-purple-700 border border-purple-100'
                                    }`}
                                  >
                                    {exercise.type}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {exercise.sets} sets
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {exercise.reps} reps
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {exercise.rest}s rest
                              </div>
                            </div>
                          </div>
                          {exercise.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                              {exercise.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleStartDay(dayPlan)}
                      variant="primary"
                      size="sm"
                      className="w-full"
                    >
                      <FaDumbbell className="mr-2" />
                      Start This Workout
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default WeeklyPlanView;
