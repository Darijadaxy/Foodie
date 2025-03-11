import { memo } from "react";
import Restoran from "./Restoran"

function ListaRestorana(props){
    return props.lista.map((restoran) => (
        <Restoran key={restoran.idRestorana} restoran={restoran}></Restoran>
    ))
}

export default memo(ListaRestorana)