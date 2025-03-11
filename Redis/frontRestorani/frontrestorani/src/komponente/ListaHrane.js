import { memo } from "react";
import Hrana from "./Hrana.js"

function ListaHrane(props){
    return props.lista.map((h) => (
        <Hrana key={h.idHrane} hrana={h}></Hrana>
    ))
}

export default memo(ListaHrane)