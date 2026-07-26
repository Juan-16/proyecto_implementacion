package com.eia.racingleague.service;

import com.eia.racingleague.model.ResultStatus;

public class PointsCalculator {

    private PointsCalculator() {
    }

    public static int pointsFor(Integer finalPosition, ResultStatus status) {
        if (status == ResultStatus.DISQUALIFIED
                || status == ResultStatus.DID_NOT_FINISH
                || status == ResultStatus.DID_NOT_START) {
            return 0;
        }
        if (finalPosition == null) {
            return 0;
        }
        return switch (finalPosition) {
            case 1 -> 10;
            case 2 -> 7;
            case 3 -> 5;
            case 4 -> 3;
            case 5 -> 1;
            default -> 0;
        };
    }
}