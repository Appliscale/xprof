#include <erl_nif.h>
#include <stdio.h>
#include <string.h>
#include <sys/time.h>

/* NIF interface declarations */
static int load(ErlNifEnv* env,
                void** priv_data,
                ERL_NIF_TERM load_info);

static int upgrade(ErlNifEnv* env,
                   void** priv_data,
                   void** old_priv_data,
                   ERL_NIF_TERM load_info);

static void unload(ErlNifEnv* env,
                   void* priv_data);

/* The NIFs: */
static ERL_NIF_TERM enabled(ErlNifEnv* env,
                            int argc,
                            const ERL_NIF_TERM argv[]);

static ERL_NIF_TERM trace(ErlNifEnv* env,
                          int argc,
                          const ERL_NIF_TERM argv[]);

static ERL_NIF_TERM trace_call(ErlNifEnv* env,
                               int argc,
                               const ERL_NIF_TERM argv[]);

static ErlNifFunc nif_funcs[] = {
        {"enabled", 3, enabled},
        {"trace", 5, trace},
        {"trace_call", 5, trace_call}
};

ERL_NIF_INIT(xprof_core_nif_tracer, nif_funcs, load, NULL, upgrade, unload)

/* Local functions */

static void read_mfa(ErlNifEnv * env,
                     const ERL_NIF_TERM mfa_tuple,
                     char * module,
                     char * function,
                     int  * arity)
{
    const ERL_NIF_TERM * tuple;
    int                  tuple_arity;

    enif_get_tuple(env, mfa_tuple, &tuple_arity, &tuple);
    enif_get_atom(env, tuple[0], module,   256, ERL_NIF_LATIN1);
    enif_get_atom(env, tuple[1], function, 256, ERL_NIF_LATIN1);
    enif_get_int(env, tuple[2], arity);
}

static ERL_NIF_TERM create_mfa_tuple(ErlNifEnv * env,
                             char * module,
                             char * function,
                             int    arity)
{
    return enif_make_tuple3(
            env,
            enif_make_atom(env, module),
            enif_make_atom(env, function),
            enif_make_int (env, arity)
    );
}

static ERL_NIF_TERM mfa_to_bin(ErlNifEnv * env,
                               const ERL_NIF_TERM mfa_tuple)
{
    const ERL_NIF_TERM * tuple;
    int                  tuple_arity;

    unsigned char module[256];
    unsigned char function[256];
    int           arity;

    enif_get_tuple(env, mfa_tuple, &tuple_arity, &tuple);
    enif_get_atom(env, tuple[0], module,   256, ERL_NIF_LATIN1);
    enif_get_atom(env, tuple[1], function, 256, ERL_NIF_LATIN1);
    enif_get_int(env, tuple[2], &arity);

    unsigned char buffer[256];
    sprintf(buffer, "%s:%s/%d", module, function, arity);

    int len = strlen(buffer);
    ERL_NIF_TERM bin;
    unsigned char * binstr = enif_make_new_binary(env, len, &bin);
    memcpy(binstr, buffer, len);

    return bin;
}

static ERL_NIF_TERM create_timestamp(ErlNifEnv * env)
{
    struct timeval timepoint;
    gettimeofday(&timepoint, NULL);

    int megasec  = timepoint.tv_usec / 1000000000000;
    int sec      = timepoint.tv_usec / 1000000 - megasec * 1000000;
    int microsec = timepoint.tv_usec % 1000000;

    return enif_make_tuple3(
            env,
            enif_make_int(env, megasec),
            enif_make_int(env, sec),
            enif_make_int(env, microsec)
    );
}

/* End of locals */

static int load(ErlNifEnv* env, void** priv_data, ERL_NIF_TERM load_info)
{
    *priv_data = NULL;
    return 0;
}

static void unload(ErlNifEnv* env, void* priv_data)
{

}

static int upgrade(ErlNifEnv* env, void** priv_data, void** old_priv_data,
                   ERL_NIF_TERM load_info)
{
    if (*old_priv_data != NULL || *priv_data != NULL) {
        return -1; /* Don't know how to do that */
    }
    if (load(env, priv_data, load_info)) {
        return -1;
    }
    return 0;
}

/*
 * argv[0]: TraceTag
 * argv[1]: TracerState
 * argv[2]: Tracee
 */
static ERL_NIF_TERM enabled(ErlNifEnv* env, int argc, const ERL_NIF_TERM argv[])
{
    ErlNifPid to_pid;

    if (enif_get_local_pid(env, argv[1], &to_pid)) {
        if (!enif_is_process_alive(env, &to_pid)) {
            if (enif_is_identical(enif_make_atom(env, "trace_status"), argv[0])) {
                /* tracer is dead so we should remove this tracepoint */
                return enif_make_atom(env, "remove");
            }
            else {
                return enif_make_atom(env, "discard");
            }
        }
    }


    /* Only generate trace for when tracer != tracee */
    if (enif_is_identical(argv[1], argv[2])) {
        return enif_make_atom(env, "discard");
    }

    /* Only trigger trace messages on 'call' or 'return_from' */
    if (enif_is_identical(enif_make_atom(env, "call"), argv[0])
    ||  enif_is_identical(enif_make_atom(env, "return_from"), argv[0])) {
        return enif_make_atom(env, "trace");
    }

    /* Have to answer trace_status */
    if (enif_is_identical(enif_make_atom(env, "trace_status"), argv[0])) {
        return enif_make_atom(env, "trace");
    }

    return enif_make_atom(env, "discard");
}

/*
 * argv[0]: TraceTag, should only be 'send'
 * argv[1]: TracerState, process to send {Tracee, Recipient} to
 * argv[2]: Tracee
 * argv[3]: Message
 * argv[4]: Options, map containing Recipient
 */
static ERL_NIF_TERM trace(ErlNifEnv* env, int argc, const ERL_NIF_TERM argv[])
{
    printf("Normal trace.\n");

    return enif_make_tuple2(
            env,
            enif_make_atom(env, "error"),
            enif_make_string(env, "Only \"call\" and \"return_of\" are supported.", ERL_NIF_LATIN1)
            );
}

/*
 * argv[0]: TraceTag - call || return_from
 * argv[1]: TracerState, process to send {Tracee, Recipient} to
 * argv[2]: Tracee   - pid#port
 * argv[3]: Message  - {M, F, A}
 * argv[4]: Options  - map with all the shit
 */
static ERL_NIF_TERM trace_call(ErlNifEnv* env, int argc, const ERL_NIF_TERM argv[])
{
    ErlNifPid    to_pid;
    ERL_NIF_TERM msg;
    ERL_NIF_TERM mfa;
    ERL_NIF_TERM bin;
    ERL_NIF_TERM timestamp = create_timestamp(env);

    // read traced function
    char module[256];
    char function[256];
    int  arity;
    read_mfa(env, argv[3], module, function, &arity);
    mfa = create_mfa_tuple(env, module, function, arity);
    bin = mfa_to_bin(env, argv[3]);

    // send back message
    if (enif_get_local_pid(env, argv[1], &to_pid)) {
        if (enif_is_identical(enif_make_atom(env, "call"), argv[0])) {
            msg = enif_make_tuple6(
                    env,
                    enif_make_atom(env, "trace_ts"),
                    argv[2],
                    argv[0],
                    mfa,
                    enif_make_atom(env, "arity"),
                    timestamp
            );
        }
        else if (enif_is_identical(enif_make_atom(env, "return_from"), argv[0])) {
            msg = enif_make_tuple6(
                    env,
                    enif_make_atom(env, "trace_ts"),
                    argv[2],
                    argv[0],
                    mfa,
                    enif_make_list1(
                            env,
                            enif_make_tuple2(
                                    env,
                                    mfa,
                                    bin
                            )
                    ),
                    timestamp
            );
        }
        else {
            return enif_make_atom(env, "error");
        }

        enif_send(env, &to_pid, NULL, msg);
    }

    return enif_make_atom(env, "ok");
}

//// iterate over map to see keys
//ERL_NIF_TERM key, value;
//ErlNifMapIterator iter;
//enif_map_iterator_create(env, argv[4], &iter, ERL_NIF_MAP_ITERATOR_FIRST);
//
//while (enif_map_iterator_get_pair(env, &iter, &key, &value)) {
//char atom[20] = {0};
//enif_get_atom(env, key, atom, 20, ERL_NIF_LATIN1);
//printf("Atom: %s\n", atom);
////do_something(key,value);
//enif_map_iterator_next(env, &iter);
//}
//
//enif_map_iterator_destroy(env, &iter);

//// traversing tuple
//enif_get_tuple(env, argv[3], &arity, &tuple);
//for (int i = 0; i < arity; ++i) {
//char atom[256];
//enif_get_atom(env, tuple[i], atom, 256, ERL_NIF_LATIN1);
//printf("Elem %d: %s, is tuple? %d\n", i, atom, enif_is_tuple(env, tuple[i]));
//}