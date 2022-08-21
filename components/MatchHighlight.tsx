import {Fragment} from 'react';
import styled from '@emotion/styled';
import type Fuse from 'fuse.js';

type Match = Fuse.FuseResultMatch;

type HighlightResult = {
  highlight: boolean;
  text: string;
};

type MatchResult = HighlightResult[];

const getFuseMatches = ({value, indices}: Match): MatchResult => {
  if (value === undefined) {
    return [];
  }

  if (indices.length === 0) {
    return [{highlight: false, text: value}];
  }

  const strLength = value.length;
  const result: MatchResult = [];
  let prev: [number, number] = [0, -1];

  indices.forEach(([start, end]) => {
    // Unhighlighted string before the match
    const stringBeforeMatch = value.substring(prev[1] + 1, start);

    // Only add to result if non-empty string
    if (stringBeforeMatch) {
      result.push({
        highlight: false,
        text: stringBeforeMatch,
      });
    }

    // This is the matched string, which should be highlighted
    const matchedString = value.substring(start, end + 1);
    result.push({
      highlight: true,
      text: matchedString,
    });

    prev = [start, end];
  });

  // The rest of the string starting from the last match index
  const restOfString = value.substring(prev[1] + 1, strLength);
  // Only add to result if non-empty string
  if (restOfString) {
    result.push({highlight: false, text: restOfString});
  }

  return result;
};

type Props = {
  match: Match;
};

/**
 * Given a match object from fuse.js, returns an array of components with
 * "highlighted" (bold) substrings.
 */
const MatchHighlight = ({match}: Props) => (
  <Fragment>
    {getFuseMatches(match).map(({highlight, text}, index) => {
      if (!text) {
        return <Fragment />;
      }
      if (highlight) {
        return <Marker key={index}>{text}</Marker>;
      }

      return <span key={index}>{text}</span>;
    })}
  </Fragment>
);

const Marker = styled('mark')`
  background: #ffb9d1;
  box-shadow: 0px 1px 0 #f23978;
`;

export default MatchHighlight;
