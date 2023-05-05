select
    s.shinryoucode
from
    visit_shinryou as s
where
    not exists(
        select
            *
        from
            visit as v
            inner join shinryoukoui_master_arch as m
        where
            s.visit_id = v.visit_id
            and s.shinryoucode = m.shinryoucode
            and m.valid_from <= date(v.v_datetime)
            and (
                m.valid_upto = '0000-00-00'
                or date(v.v_datetime) <= m.valid_upto
            )
    );

select
    s.shinryoucode
from
    visit_conduct_shinryou as s
where
    not exists(
        select
            *
        from
            visit_conduct as c
            inner join visit as v on c.visit_id = v.visit_id
            inner join shinryoukoui_master_arch as m
        where
            s.visit_conduct_id = c.id
            and m.shinryoucode = s.shinryoucode
            and m.valid_from <= date(v.v_datetime)
            and (
                m.valid_upto = '0000-00-00'
                or date(v.v_datetime) <= m.valid_upto
            )
    )