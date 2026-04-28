import React, { useState } from 'react';
import { Play, X, Youtube, ExternalLink } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';

const ExerciseVideo = ({ exerciseName, className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // Generate YouTube search URL for the exercise
  const getYouTubeSearchUrl = (exercise) => {
    const query = `${exercise} exercise form tutorial`;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  };

  // Generate embedded YouTube video URL (using a common exercise video as placeholder)
  const getEmbeddedVideoUrl = (exercise) => {
    // In a real app, you would have a database mapping exercises to specific video IDs
    // For now, we'll use a generic approach
    const exerciseLower = exercise.toLowerCase();
    
    // Common exercise video IDs (placeholder - in production, use a proper mapping)
    const videoMap = {
      'bench press': '2yss8WhJHsM',
      'squat': 'ultWZbQSL6E',
      'deadlift': 'op9kVnSso6Q',
      'overhead press': '2yjwXTZQDDI',
      'barbell row': 'G8l_8chR5BE',
      'pull up': 'eGo4IYlbE5g',
      'lat pulldown': 'CAwf7n6Luuc',
      'dumbbell curl': 'ykJmrZ5v0Oo',
      'tricep extension': 'cCZL4H3tAQg',
      'leg press': 'IZxyjW7MPJQ',
      'lunge': 'QOVaHwm-Q6U',
      'plank': 'ASdvN_XEl_c',
    };

    // Try to find a match
    for (const [key, videoId] of Object.entries(videoMap)) {
      if (exerciseLower.includes(key)) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // Default to a general exercise tutorial
    return 'https://www.youtube.com/embed/3w6Ky-1Zk2g';
  };

  const handleOpenVideo = () => {
    setVideoUrl(getEmbeddedVideoUrl(exerciseName));
    setIsModalOpen(true);
  };

  const handleOpenYouTube = () => {
    const searchUrl = getYouTubeSearchUrl(exerciseName);
    window.open(searchUrl, '_blank');
  };

  return (
    <div className={className}>
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenVideo}
          icon={Play}
          iconPosition="left"
        >
          Watch Tutorial
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenYouTube}
          icon={Youtube}
          iconPosition="left"
        >
          More Videos
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${exerciseName} Tutorial`}
        size="lg"
      >
        <div className="aspect-video w-full bg-gray-900 rounded-lg overflow-hidden">
          <iframe
            src={videoUrl}
            title={`${exerciseName} Tutorial`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Watch proper form and technique for {exerciseName}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenYouTube}
            icon={ExternalLink}
            iconPosition="left"
          >
            Open in YouTube
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// Exercise video card component for displaying in workout lists
const ExerciseVideoCard = ({ exercise, className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const getEmbeddedVideoUrl = (exercise) => {
    const exerciseLower = exercise.toLowerCase();
    const videoMap = {
      'bench press': '2yss8WhJHsM',
      'squat': 'ultWZbQSL6E',
      'deadlift': 'op9kVnSso6Q',
      'overhead press': '2yjwXTZQDDI',
      'barbell row': 'G8l_8chR5BE',
      'pull up': 'eGo4IYlbE5g',
      'lat pulldown': 'CAwf7n6Luuc',
      'dumbbell curl': 'ykJmrZ5v0Oo',
      'tricep extension': 'cCZL4H3tAQg',
      'leg press': 'IZxyjW7MPJQ',
      'lunge': 'QOVaHwm-Q6U',
      'plank': 'ASdvN_XEl_c',
    };

    for (const [key, videoId] of Object.entries(videoMap)) {
      if (exerciseLower.includes(key)) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return 'https://www.youtube.com/embed/3w6Ky-1Zk2g';
  };

  const handleOpenVideo = () => {
    setVideoUrl(getEmbeddedVideoUrl(exercise));
    setIsModalOpen(true);
  };

  return (
    <Card
      variant="default"
      padding="sm"
      hover
      onClick={handleOpenVideo}
      className={`cursor-pointer group ${className}`}
    >
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-3">
        <img
          src={`https://img.youtube.com/vi/${getEmbeddedVideoUrl(exercise).split('/').pop()}/hqdefault.jpg`}
          alt={exercise}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 dark:bg-black/80 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-gray-900 dark:text-white ml-1" />
          </div>
        </div>
      </div>
      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
        {exercise} Tutorial
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Watch proper form
      </p>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${exercise} Tutorial`}
        size="lg"
      >
        <div className="aspect-video w-full bg-gray-900 rounded-lg overflow-hidden">
          <iframe
            src={videoUrl}
            title={`${exercise} Tutorial`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </Modal>
    </Card>
  );
};

ExerciseVideo.Card = ExerciseVideoCard;

export default ExerciseVideo;
