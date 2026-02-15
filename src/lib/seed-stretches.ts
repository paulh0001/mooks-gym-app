import { Stretch } from './types';

export function seedStretches(): Stretch[] {
  return [
    {
      id: 'stretch_chest',
      name: 'Chest Doorway Stretch',
      instructions: 'Stand in a doorway, arms on frame at 90°. Lean forward gently until you feel a stretch across your chest.',
      durationSeconds: 30,
      targetMuscles: ['chest', 'shoulders'],
    },
    {
      id: 'stretch_quad',
      name: 'Standing Quad Stretch',
      instructions: 'Stand on one leg. Pull the other foot to your glute. Keep knees together. Hold, then switch.',
      durationSeconds: 30,
      targetMuscles: ['quads'],
    },
    {
      id: 'stretch_hamstring',
      name: 'Standing Hamstring Stretch',
      instructions: 'Place one heel on a low surface. Hinge at hips toward your toes. Keep your back flat.',
      durationSeconds: 30,
      targetMuscles: ['hamstrings'],
    },
    {
      id: 'stretch_hip_flexor',
      name: 'Kneeling Hip Flexor Stretch',
      instructions: 'Kneel on one knee, other foot forward. Push hips forward gently. Feel the stretch in the front of your hip.',
      durationSeconds: 30,
      targetMuscles: ['quads', 'glutes'],
    },
    {
      id: 'stretch_shoulder',
      name: 'Cross-Body Shoulder Stretch',
      instructions: 'Pull one arm across your chest with the other hand. Hold. Switch sides.',
      durationSeconds: 30,
      targetMuscles: ['shoulders', 'back'],
    },
    {
      id: 'stretch_tricep',
      name: 'Overhead Tricep Stretch',
      instructions: 'Raise one arm, bend elbow so hand reaches behind your head. Gently pull elbow with other hand.',
      durationSeconds: 30,
      targetMuscles: ['triceps'],
    },
    {
      id: 'stretch_cat_cow',
      name: 'Cat-Cow Stretch',
      instructions: 'On all fours, alternate between arching your back (cow) and rounding it (cat). Move slowly with your breath.',
      durationSeconds: 40,
      targetMuscles: ['back', 'core'],
    },
    {
      id: 'stretch_child_pose',
      name: "Child's Pose",
      instructions: 'Kneel, sit back on heels, reach arms forward on the floor. Relax and breathe deeply.',
      durationSeconds: 40,
      targetMuscles: ['back', 'shoulders'],
    },
    {
      id: 'stretch_figure_four',
      name: 'Figure Four Stretch',
      instructions: 'Lie on back. Cross one ankle over opposite knee. Pull the bottom leg toward you. Feel the stretch in your glute.',
      durationSeconds: 30,
      targetMuscles: ['glutes'],
    },
    {
      id: 'stretch_calf',
      name: 'Wall Calf Stretch',
      instructions: 'Hands on wall, one foot back with heel down. Lean in until you feel the calf stretch. Switch sides.',
      durationSeconds: 30,
      targetMuscles: ['calves'],
    },
  ];
}
