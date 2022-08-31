import numpy as np
from .newrk import RKSolver

def solve_ivp(fun, t_span, y0):

    t0, tf = float(t_span[0]), float(t_span[1])

    a = []
    b = []

    for p0 in y0:

        solver = RKSolver(fun, t0, p0, tf)
        ts = [t0]
        ys = [p0]

        #events, is_terminal, event_dir = prepare_events(events)

        #if events is not None:
        #    g = [event(t0, y0) for event in events]
        #    t_events = [[] for _ in range(len(events))]
        #else:
        #    t_events = None

        status = None
        while status is None:
            solver.step()
            #print(solver.y)

            if solver.status == 'finished':
                status = 0
            elif solver.status == 'failed':
                status = -1
                break

            #t_old = solver.t_old
            t = solver.t
            y = solver.y

            #if events is not None:
            #    g_new = [event(t, y) for event in events]
            #    active_events = find_active_events(g, g_new, event_dir)
            #    if active_events.size > 0:
            #        if sol is None:
            #            sol = solver.dense_output()
            #        root_indices, roots, terminate = handle_events(
            #            sol, events, active_events, is_terminal, t_old, t)
            #        for e, te in zip(root_indices, roots):
            #            t_events[e].append(te)
            #        if terminate:
            #            status = 1
            #            t = roots[-1]
            #            y = sol(t)
            #    g = g_new

            ts.append(t)
            ys.append(y)


        ts = np.hstack(ts)
        ys = np.stack(np.asarray(ys), axis=-1)

        a.append(ts)
        b.append(ys)

    return np.asarray(b, dtype=np.float)[0]