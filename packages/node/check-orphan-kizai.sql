select
    k.kizaicode
from
    visit_conduct_kizai as k
where
    not exists(
        select
            *
        from
            visit_conduct as c
            inner join visit as v on c.visit_id = v.visit_id
            inner join tokuteikizai_master_arch as m
        where
            k.visit_conduct_id = c.id
            and m.kizaicode = k.kizaicode
            and m.valid_from <= date(v.v_datetime)
            and (
                m.valid_upto = '0000-00-00'
                or date(v.v_datetime) <= m.valid_upto
            )
    )