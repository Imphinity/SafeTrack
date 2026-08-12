package com.example.pompieri.model;

/**
 * Reprezinta un mesaj de date trimis de ESP32.
 * Campurile corespund JSON-ului trimis de placa - Jackson le converteste automat.
 */
public class SensorData {

    private String idDispozitiv;
    private Integer puls;
    private Integer spo2;
    private Double temperatura;
    private Double umiditate;
    private Integer gaz;
    private Double latitudine;
    private Double longitudine;
    private Boolean cadere;
    private Integer nivelBaterie;
    private String dataOra;

    public SensorData() {
    }

    // getters si setters - necesare pentru ca Jackson sa poata converti JSON <-> obiect

    public String getIdDispozitiv() { return idDispozitiv; }
    public void setIdDispozitiv(String idDispozitiv) { this.idDispozitiv = idDispozitiv; }

    public Integer getPuls() { return puls; }
    public void setPuls(Integer puls) { this.puls = puls; }

    public Integer getSpo2() { return spo2; }
    public void setSpo2(Integer spo2) { this.spo2 = spo2; }

    public Double getTemperatura() { return temperatura; }
    public void setTemperatura(Double temperatura) { this.temperatura = temperatura; }

    public Double getUmiditate() { return umiditate; }
    public void setUmiditate(Double umiditate) { this.umiditate = umiditate; }

    public Integer getGaz() { return gaz; }
    public void setGaz(Integer gaz) { this.gaz = gaz; }

    public Double getLatitudine() { return latitudine; }
    public void setLatitudine(Double latitudine) { this.latitudine = latitudine; }

    public Double getLongitudine() { return longitudine; }
    public void setLongitudine(Double longitudine) { this.longitudine = longitudine; }

    public Boolean getCadere() { return cadere; }
    public void setCadere(Boolean cadere) { this.cadere = cadere; }

    public Integer getNivelBaterie() { return nivelBaterie; }
    public void setNivelBaterie(Integer nivelBaterie) { this.nivelBaterie = nivelBaterie; }

    public String getDataOra() { return dataOra; }
    public void setDataOra(String dataOra) { this.dataOra = dataOra; }

    @Override
    public String toString() {
        return "SensorData{idDispozitiv='" + idDispozitiv + "', puls=" + puls +
                ", temperatura=" + temperatura + ", gaz=" + gaz + "}";
    }
}