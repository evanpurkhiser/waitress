import {Fragment} from 'react';

import styled from '@emotion/styled';
import type {FuseResultMatch} from 'fuse.js';

type Match = FuseResultMatch;

interface HighlightResult {
  highlight: boolean;
  start: number;
  text: string;
}

type MatchResult = HighlightResult[];

const getFuseMatches = ({value, indices}: Match): MatchResult => {
  if (value === undefined) {
    return [];
  }

  if (indices.length === 0) {
    return [{highlight: false, start: 0, text: value}];
  }

  const strLength = value.length;
  const result: MatchResult = [];
  let prev: [number, number] = [0, -1];

  indices.forEach(([start, end]) => {
    // Unhighlighted string before the match
    const stringBeforeMatch = value.slice(prev[1] + 1, start);

    // Only add to result if non-empty string
    if (stringBeforeMatch) {
      result.push({
        highlight: false,
        start: prev[1] + 1,
        text: stringBeforeMatch,
      });
    }

    // This is the matched string, which should be highlighted
    const matchedString = value.slice(start, end + 1);
    result.push({
      highlight: true,
      start,
      text: matchedString,
    });

    prev = [start, end];
  });

  // The rest of the string starting from the last match index
  const restOfString = value.slice(prev[1] + 1, strLength);
  // Only add to result if non-empty string
  if (restOfString) {
    result.push({highlight: false, start: prev[1] + 1, text: restOfString});
  }

  return result;
};

interface Props {
  match: Match;
}

/**
 * Given a match object from fuse.js, returns an array of components with
 * "highlighted" (bold) substrings.
 */
const MatchHighlight = ({match}: Props) => (
  <>
    {getFuseMatches(match).map(({highlight, start, text}) => {
      if (!text) {
        return <Fragment key={`blank-${start}`} />;
      }
      if (highlight) {
        return <Marker key={start}>{text}</Marker>;
      }

      return <span key={start}>{text}</span>;
    })}
  </>
);

const Marker = styled('mark')`
  color: var(--text);
  background: var(--matchbackground);
  box-shadow: 0px 1px 0 var(--matchUnderline);
`;

export {MatchHighlight};
