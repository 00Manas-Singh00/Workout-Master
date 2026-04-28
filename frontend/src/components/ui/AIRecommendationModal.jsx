import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Card from './Card';
import { FaRobot, FaCalendarWeek, FaDumbbell, FaSpinner } from 'react-icons/fa';

const AIRecommendationModal = ({ isOpen, onClose, userProfile, onGenerate }) => {
  const [planType, setPlanType] = useState('session');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(planType);
      onClose();
    } catch (error) {
      console.error('Failed to generate recommendation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Workout Recommendation">
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <FaRobot className="text-2xl text-blue-500" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Get a personalized workout plan based on your workout history and preferences
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Choose Plan Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Card
              onClick={() => setPlanType('session')}
              className={`cursor-pointer transition-all duration-200 ${
                planType === 'session'
                  ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex flex-col items-center gap-3 p-4">
                <FaDumbbell className={`text-3xl ${planType === 'session' ? 'text-green-500' : 'text-gray-400'}`} />
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Single Session</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Get a workout for today
                  </p>
                </div>
              </div>
            </Card>

            <Card
              onClick={() => setPlanType('week')}
              className={`cursor-pointer transition-all duration-200 ${
                planType === 'week'
                  ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex flex-col items-center gap-3 p-4">
                <FaCalendarWeek className={`text-3xl ${planType === 'week' ? 'text-green-500' : 'text-gray-400'}`} />
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Weekly Plan</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    7-day structured plan
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button onClick={onClose} variant="outline" size="md">
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            loading={isGenerating}
            variant="primary"
            size="md"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <FaRobot className="mr-2" />
                Generate Plan
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AIRecommendationModal;
