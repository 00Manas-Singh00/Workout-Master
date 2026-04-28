import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Badge from '../ui/Badge';

const OnboardingFlow = ({ onComplete, initialData = {} }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({
    fitnessLevel: initialData.fitnessLevel || '',
    goals: initialData.goals || [],
    equipment: initialData.equipment || [],
    age: initialData.age || '',
    sex: initialData.sex || '',
    height: initialData.height || '',
    weight: initialData.weight || '',
    units: initialData.units || 'metric',
  });

  const steps = [
    {
      title: 'Fitness Level',
      component: FitnessLevelStep,
    },
    {
      title: 'Your Goals',
      component: GoalsStep,
    },
    {
      title: 'Equipment',
      component: EquipmentStep,
    },
    {
      title: 'Personal Details',
      component: PersonalDetailsStep,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      index <= currentStep
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className="text-xs mt-2 text-gray-600 dark:text-gray-400 hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      index < currentStep ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Current Step */}
        <CurrentComponent data={data} setData={setData} />

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            icon={ChevronLeft}
            iconPosition="left"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            icon={ChevronRight}
            iconPosition="right"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

const FitnessLevelStep = ({ data, setData }) => {
  const levels = [
    { value: 'beginner', label: 'Beginner', description: 'New to fitness or returning after a long break' },
    { value: 'intermediate', label: 'Intermediate', description: 'Regular training for 6+ months' },
    { value: 'advanced', label: 'Advanced', description: 'Consistent training for 2+ years' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        What's your fitness level?
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This helps us customize your workout intensity
      </p>
      <div className="space-y-3">
        {levels.map((level) => (
          <Card
            key={level.value}
            variant={data.fitnessLevel === level.value ? 'primary' : 'default'}
            padding="md"
            hover
            onClick={() => setData({ ...data, fitnessLevel: level.value })}
            className="cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  data.fitnessLevel === level.value
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {data.fitnessLevel === level.value && <Check className="w-3 h-3 text-white" />}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{level.label}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{level.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const GoalsStep = ({ data, setData }) => {
  const goals = [
    { value: 'strength', label: 'Build Strength', icon: '💪' },
    { value: 'hypertrophy', label: 'Build Muscle', icon: '🏋️' },
    { value: 'fat_loss', label: 'Lose Weight', icon: '🔥' },
    { value: 'general_fitness', label: 'General Fitness', icon: '⚡' },
    { value: 'sports_performance', label: 'Sports Performance', icon: '🏆' },
  ];

  const toggleGoal = (goal) => {
    const newGoals = data.goals.includes(goal)
      ? data.goals.filter((g) => g !== goal)
      : [...data.goals, goal];
    setData({ ...data, goals: newGoals });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        What are your goals?
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Select all that apply (choose at least one)
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {goals.map((goal) => (
          <Card
            key={goal.value}
            variant={data.goals.includes(goal.value) ? 'primary' : 'default'}
            padding="md"
            hover
            onClick={() => toggleGoal(goal.value)}
            className="cursor-pointer text-center"
          >
            <div className="text-3xl mb-2">{goal.icon}</div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{goal.label}</h3>
          </Card>
        ))}
      </div>
    </div>
  );
};

const EquipmentStep = ({ data, setData }) => {
  const equipment = [
    { value: 'bodyweight', label: 'Bodyweight', icon: '🤸' },
    { value: 'dumbbells', label: 'Dumbbells', icon: '🏋️' },
    { value: 'barbell', label: 'Barbell', icon: '🏋️‍♂️' },
    { value: 'machines', label: 'Gym Machines', icon: '🏢' },
    { value: 'bands', label: 'Resistance Bands', icon: '🎗️' },
    { value: 'kettlebell', label: 'Kettlebells', icon: '🔔' },
  ];

  const toggleEquipment = (item) => {
    const newEquipment = data.equipment.includes(item)
      ? data.equipment.filter((e) => e !== item)
      : [...data.equipment, item];
    setData({ ...data, equipment: newEquipment });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        What equipment do you have access to?
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Select all that apply
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {equipment.map((item) => (
          <Card
            key={item.value}
            variant={data.equipment.includes(item.value) ? 'primary' : 'default'}
            padding="md"
            hover
            onClick={() => toggleEquipment(item.value)}
            className="cursor-pointer text-center"
          >
            <div className="text-3xl mb-2">{item.icon}</div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</h3>
          </Card>
        ))}
      </div>
    </div>
  );
};

const PersonalDetailsStep = ({ data, setData }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Personal Details
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This helps us track your progress
      </p>
      
      <div className="space-y-4">
        <div className="flex gap-3">
          <Button
            variant={data.units === 'metric' ? 'primary' : 'outline'}
            onClick={() => setData({ ...data, units: 'metric' })}
            className="flex-1"
          >
            Metric (kg/cm)
          </Button>
          <Button
            variant={data.units === 'imperial' ? 'primary' : 'outline'}
            onClick={() => setData({ ...data, units: 'imperial' })}
            className="flex-1"
          >
            Imperial (lbs/in)
          </Button>
        </div>

        <Input.Select
          label="Sex"
          value={data.sex}
          onChange={(e) => setData({ ...data, sex: e.target.value })}
          options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
            { value: 'prefer_not_to_say', label: 'Prefer not to say' },
          ]}
          placeholder="Select sex"
          fullWidth
        />

        <Input
          label="Age"
          type="number"
          value={data.age}
          onChange={(e) => setData({ ...data, age: e.target.value })}
          placeholder="Enter your age"
          min="13"
          max="100"
          fullWidth
        />

        <Input
          label={`Height (${data.units === 'metric' ? 'cm' : 'in'})`}
          type="number"
          value={data.height}
          onChange={(e) => setData({ ...data, height: e.target.value })}
          placeholder={`Enter height in ${data.units === 'metric' ? 'cm' : 'inches'}`}
          fullWidth
        />

        <Input
          label={`Weight (${data.units === 'metric' ? 'kg' : 'lbs'})`}
          type="number"
          value={data.weight}
          onChange={(e) => setData({ ...data, weight: e.target.value })}
          placeholder={`Enter weight in ${data.units === 'metric' ? 'kg' : 'lbs'}`}
          fullWidth
        />
      </div>
    </div>
  );
};

export default OnboardingFlow;
