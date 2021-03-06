import request from './request';
import assign from 'lodash/object/assign';

export const RESOURCE = '__resource__'; //Symbol('resource');

export default store => next => action => {
  let resourceAction = action[RESOURCE];

  if (typeof resourceAction === 'undefined') return next(action);

  const { types, meta } = resourceAction
      , { url, method, data, query, options, normalize = response => response } = resourceAction.payload
      , [ PENDING, FULFILLED, REJECTED ] = types;

  next({ type: PENDING, payload: { data: data, query: query }, meta });

  return request[method](url, { data, query, options }).then(
    response => {
      try {
        const normalized = normalize(response);
        return next({ type: FULFILLED, payload: normalized, meta: assign(meta, response.meta) });
      } catch(error) {
        return next({ type: REJECTED, payload: error, error: true, meta });
      }
    }
  , error => next({ type: REJECTED, payload: error, error: true, meta })
  );
};
