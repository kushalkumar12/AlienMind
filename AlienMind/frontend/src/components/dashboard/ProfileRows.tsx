import React from 'react';
import { WalletCards, Building2 } from 'lucide-react';
import type { Interviewer, Candidate } from '../../types';

// ─── InterviewerRow ───────────────────────────────────────────────────────────
export function InterviewerRow({ interviewer }: { interviewer: Interviewer }) {
  return (
    <article className="row">
      <div>
        <h3>{interviewer.name}</h3>
        <p>{interviewer.rankTitle}</p>
        <div className="chips">
          {interviewer.skills.map((skill) => <span key={skill}>{skill}</span>)}
        </div>
      </div>
      <div className="price">
        <WalletCards size={18} />
        <strong>${interviewer.price}</strong>
        <small>{interviewer.completed} interviews</small>
      </div>
    </article>
  );
}

// ─── CandidateRow ─────────────────────────────────────────────────────────────
export function CandidateRow({
  candidate,
  onSelect,
}: {
  candidate: Candidate;
  onSelect: (candidate: Candidate) => void;
}) {
  return (
    <article className="row clickable" onClick={() => onSelect(candidate)}>
      <div>
        <h3>{candidate.name}</h3>
        <p>{candidate.level} — {candidate.summary}</p>
        <div className="chips">
          {candidate.skills.map((skill) => <span key={skill}>{skill}</span>)}
        </div>
      </div>
      <div className="price">
        <Building2 size={18} />
        <strong>{candidate.score}/10</strong>
        <small>{candidate.completed} interviews</small>
      </div>
    </article>
  );
}
