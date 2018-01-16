import { initial } from 'lodash';
import { captureDecision } from '../utils/CommonUtils';
import { CAPTURE_ACTION } from '../constants/TracingConstants';

export const determineNextCapture = (json, lastCapture, capture, name) => {
  let captureForFun;
  switch (captureDecision(json, lastCapture)) {
    case CAPTURE_ACTION.APP_INITIALIZATION:
    case CAPTURE_ACTION.START_FIRST_CAPTURE:
      captureForFun = [
        {
          captureId: json.capture_id,
          items: json.items.map(item => ({ ...item, expanded: false })),
          has_more: json.has_more,
        },
      ];
      break;
    case CAPTURE_ACTION.START_NEXT_CAPTURE:
      captureForFun = [
        ...capture[name],
        {
          captureId: json.capture_id,
          items: json.items.map(item => ({ ...item, expanded: false })),
          has_more: json.has_more,
        },
      ];
      break;
    case CAPTURE_ACTION.CAPTURING:
    case CAPTURE_ACTION.LAST_CAPTURE:
      captureForFun = [
        ...initial(capture[name]),
        {
          captureId: lastCapture.captureId,
          items: [
            ...lastCapture.items,
            ...json.items.map(item => ({ ...item, expanded: false })),
          ],
          has_more: json.has_more,
        },
      ];
      break;
    default:
      break;
  }
  return captureForFun;
};

export const determineNextControl = (json, lastCapture) => {
  let control;
  switch (captureDecision(json, lastCapture)) {
    case CAPTURE_ACTION.APP_INITIALIZATION:
    case CAPTURE_ACTION.LAST_CAPTURE:
      control = {
        threshold: undefined,
        limit: undefined,
        collecting: false,
      };
      break;
    case CAPTURE_ACTION.START_FIRST_CAPTURE:
    case CAPTURE_ACTION.START_NEXT_CAPTURE:
      control = {
        threshold: json.threshold,
        limit: json.limit,
        collecting: true,
      };
      break;
    default:
      break;
  }
  return control;
};
