select
    d.d_iyakuhincode
from
    visit_drug as d
where
    not exists(
        select
            *
        from
            visit as v
            inner join iyakuhin_master_arch as m
        where
            d.visit_id = v.visit_id
            and d.d_iyakuhincode = m.iyakuhincode
            and m.valid_from <= date(v.v_datetime)
            and (
                m.valid_upto = '0000-00-00'
                or date(v.v_datetime) <= m.valid_upto
            )
    );

select
    d.iyakuhincode
from
    visit_conduct_drug as d
where
    not exists(
        select
            *
        from
            visit_conduct as c
            inner join visit as v on c.visit_id = v.visit_id
            inner join iyakuhin_master_arch as m
        where
            d.visit_conduct_id = c.id
            and m.iyakuhincode = d.iyakuhincode
            and m.valid_from <= date(v.v_datetime)
            and (
                m.valid_upto = '0000-00-00'
                or date(v.v_datetime) <= m.valid_upto
            )
    )