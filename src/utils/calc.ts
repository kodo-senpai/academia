import { Subject, SubjectStats } from '../types';

export function calculateSubjectStats(subj: Subject, globalTarget: number = 75): SubjectStats {
  const target = subj.target || globalTarget || 75;
  const attended = Number(subj.attended) || 0;
  const total = Number(subj.total) || 0;
  const pct = total > 0 ? (attended / total) * 100 : 0;

  let safeBunks = 0;
  let mustAttend = 0;

  if (pct >= target) {
    // Safe Bunks: floor((Attended * 100 - Target * Total) / Target)
    safeBunks = Math.floor((attended * 100 - target * total) / target);
    if (safeBunks < 0) safeBunks = 0;
  } else {
    // Must Attend: ceil((Target * Total - 100 * Attended) / (100 - Target))
    mustAttend = Math.ceil((target * total - 100 * attended) / (100 - target));
    if (mustAttend < 0) mustAttend = 0;
  }

  return {
    pct: parseFloat(pct.toFixed(1)),
    target,
    safeBunks,
    mustAttend,
    isSafe: pct >= target,
  };
}

export function calculateOverallStats(subjects: Subject[], globalTarget: number = 75) {
  let grandAttended = 0;
  let grandTotal = 0;
  let totalSafeBunks = 0;
  let totalMustAttend = 0;
  const criticalSubjects: { subject: Subject; stats: SubjectStats }[] = [];
  const safeSubjects: { subject: Subject; stats: SubjectStats }[] = [];

  subjects.forEach(subj => {
    const stats = calculateSubjectStats(subj, globalTarget);
    grandAttended += Number(subj.attended);
    grandTotal += Number(subj.total);
    totalSafeBunks += stats.safeBunks;
    totalMustAttend += stats.mustAttend;

    if (!stats.isSafe) {
      criticalSubjects.push({ subject: subj, stats });
    } else if (stats.safeBunks > 0) {
      safeSubjects.push({ subject: subj, stats });
    }
  });

  const overallPct = grandTotal > 0 ? parseFloat(((grandAttended / grandTotal) * 100).toFixed(1)) : 0;

  return {
    grandAttended,
    grandTotal,
    overallPct,
    totalSafeBunks,
    totalMustAttend,
    isOverallSafe: overallPct >= globalTarget,
    criticalSubjects,
    safeSubjects,
  };
}
